import {
    isJidGroup,
    areJidsSameUser
} from 'baileys'
import { bot } from '../index.js'
import { loadJson, saveJson, log } from './helper.js'
import { allPath } from './static.js'
import fs from 'node:fs'

class Store {
    sock = null
    groupMetadata = new Map()
    chats = new Map()
    contacts = new Map()

    constructor() {
        // load all chats file
        const listFile = fs.readdirSync(allPath.storeChatsPath)
        listFile.forEach(fileName => {
            const key = fileName.replace(/\.json$/, '')
            const json = loadJson(allPath.storeChatsPath + '/' + fileName)
            this.chats.set(key, json)
        })
    }

    getGroupMetadata = async (jid) => {
        let data = this.groupMetadata.get(jid)
        if (!data) {
            try {
                const fresh = await this.sock.groupMetadata(jid)
                log(`↗️ fetch group metadata: ${fresh.subject}`, fresh)
                this.groupMetadata.set(jid, fresh)

                const ed = fresh.ephemeralDuration || null
                const name = fresh.subject
                this.updateChats(jid, { name, ed })

                return fresh
            } catch (error) {
                log(`gagal fetch group metadata: ${jid}`, error)
                return undefined
            }
        } else {
            log(`♻️ cache: ${data.subject}`)
            return data
        }
    }

    bind = (sock) => {
        this.sock = sock
        sock.ev.process(async (ev) => {
            // [contacts]
            if (ev['contacts.update']) {
                const bem = ev['contacts.update']
                for (let i = 0; i < bem.length; i++) {
                    const partialUpdate = bem[i]
                    const id = partialUpdate.id
                    delete partialUpdate.id
                    this.contacts.set(id, partialUpdate)
                }
            }

            // [groupMetadata] 
            if (ev['groups.update']) {
                const bem = ev['groups.update']
                for (let i = 0; i < bem.length; i++) {
                    const partialUpdate = bem[i] //bem (baileys event map), karena bentukan array jadi musti di ambil 1 1
                    const jid = partialUpdate.id // simpen dulu current jid nyah

                    delete partialUpdate.author //store asli gk ada key author. jadi gw hapus :v
                    delete partialUpdate.id //key .id udh ada, jadi gak ush ditambah lagi

                    const current = await this.getGroupMetadata(jid) //ambil dulu grup matadata current jid
                    Object.assign(current, partialUpdate)
                    console.log(partialUpdate)
                }
            }

            // [groupMetadata] [chats]
            if (ev['groups.upsert']) {
                const bem = ev['groups.upsert']
                for (let i = 0; i < bem.length; i++) {
                    const newGroupMetaData = bem[i] //bem (baileys event map), karena bentukan array jadi musti di ambil 1 1
                    const jid = newGroupMetaData.id // simpen dulu current jid nyah

                    delete newGroupMetaData.author //store asli gk ada key author. jadi gw hapus :v
                    newGroupMetaData.addressingMode = 'lid'

                    this.groupMetadata.set(jid, newGroupMetaData) //simpen data baru ke store

                    if (newGroupMetaData.ephemeralDuration) {
                        const ed = newGroupMetaData.ephemeralDuration
                        const name = newGroupMetaData.subject
                        this.updateChats(jid, { name, ed })
                    }
                    console.log(newGroupMetaData)
                }
            }

            if (ev['group-participants.update']) {
                const bem = ev['group-participants.update']
                const action = bem.action
                const jid = bem.id
                const selectedParticipants = bem.participants

                const promoteDemote = async (participantsArray, nullOrAdmin) => {
                    const current = await this.getGroupMetadata(jid)
                    for (let i = 0; i < participantsArray.length; i++) {
                        const lid = participantsArray[i]
                        const find = current.participants.find(cp => cp.id == lid)
                        const newParticipantData = {
                            id: lid,
                            admin: nullOrAdmin
                        }

                        if (find) {
                            Object.assign(find, newParticipantData)
                        } else {
                            current.participants.push(newParticipantData)
                        }
                    }
                }

                const remove = async (participantsArray, gMetadata, gMetadataJid) => {
                    const isBotKicked = participantsArray.some(lid => areJidsSameUser(lid, bot.lid))
                    if (isBotKicked) {
                        console.log('bot kicked from group')
                        gMetadata.delete(gMetadataJid)
                    } else {
                        const current = await this.getGroupMetadata(gMetadataJid)
                        participantsArray.forEach(lid => {
                            const idx = current.participants.findIndex(p => p.id == lid)
                            if (idx != -1) {
                                current.participants.splice(idx, 1)
                            }
                        })
                        current.size = current.participants.length
                    }
                }

                const add = async (participantsArray) => {
                    const current = await this.getGroupMetadata(jid)

                    for (let i = 0; i < participantsArray.length; i++) {
                        const lid = participantsArray[i]
                        const find = current.participants.find(sp => sp.id == lid)
                        if (!find) {
                            current.participants.push({
                                id: lid,
                                lid: undefined,
                                phoneNumber: null,
                                admin: null
                            })
                        }
                    }
                    current.size = current.participants.length
                }

                switch (action) {
                    case 'add':
                        await add(selectedParticipants)
                        break
                    case 'promote':
                        await promoteDemote(selectedParticipants, 'admin')
                        break
                    case 'demote':
                        await promoteDemote(selectedParticipants, null)
                        break
                    case 'remove':
                        await remove(selectedParticipants, this.groupMetadata, jid)
                        break
                    case 'modify':
                        console.log('modify', bem)
                        break
                }
            }

            // [groupMetadata] [chat]
            if (ev['chats.update']) {
                const bem = ev['chats.update']
                for (let i = 0; i < bem.length; i++) {
                    const partialUpdate = bem[i] //bem (baileys event map), karena bentukan array jadi musti di ambil 1 1
                    const jid = partialUpdate.id // simpen dulu current jid nyah

                    // update ephemeral ke store grup
                    if (isJidGroup(jid)) {
                        if (!partialUpdate.hasOwnProperty('ephemeralExpiration')) return
                        const value = partialUpdate.ephemeralExpiration || undefined
                        const ephemUpdate = { ephemeralDuration: value }
                        console.log(ephemUpdate)
                        const current = await this.getGroupMetadata(jid) //ambil dulu grup matadata current jid
                        console.log(jid)
                        console.log(current)

                        Object.assign(current, ephemUpdate)
                        console.log('groupMetadata update', ephemUpdate)
                    }

                    if (partialUpdate.hasOwnProperty('ephemeralExpiration')) {
                        const name = this.groupMetadata.get(jid)?.subject || this.contacts.get(jid)?.notify || null
                        const ed = partialUpdate.ephemeralExpiration
                        this.updateChats(jid, { name, ed })
                    }
                }
            }
        })
    }

    updateChats = (jid, partialUpdate) => {
        log('chat update', partialUpdate)

        // checking file exist or no
        const filePath = allPath.storeChatsPath + '/' + jid + '.json'
        const exist = fs.existsSync(filePath)

        if (!exist) { // if file is not exist. create new one save to ram and file
            saveJson(partialUpdate, filePath)
            this.chats.set(jid, partialUpdate)
        } else { // if file exist, just update data in memory and save to file
            const currentData = this.chats.get(jid)
            const updatedJson = Object.assign(currentData, partialUpdate)
            this.chats.set(jid, updatedJson)
            saveJson(updatedJson, filePath)
        }
    }
}

export default Store