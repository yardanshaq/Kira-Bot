import { sock } from '../index.js'
import { jidNormalizedUser, isLidUser, downloadMediaMessage, isJidGroup, isPnUser as isJidUser } from 'baileys'
import { store } from '../index.js'
import fs from 'node:fs'
import { Readable } from 'node:stream'

const value = {
    thumbnailUrl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj8Jf0AJ4g-4_jHICkPf_9EpaUHjZowQnx-WNJBPgJbuAJoZf0S8prMdhsF4EiB5PeVZ52o2y7oiTMN7NVuAkkMQzVMXKBzGt1-5eGb2oWyW4sKrVHZBrzVMd-CMdHszvH9QRCDhoeQe5qqD2AJVMQUEmISh2VjAphGLpXvoaEsOmjZT7hv7zlwIgoLTXc/s16000/angelina_thumbnail_480p.webp"
    //thumbnailUrl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiNGOW7eVZd_95rRaBApj1OXMx7wcRAm0pYTsMd-4ykLhswYmI0issfSjn3Ncb2FveVdrLCXsZ2PnUfrqpS9GKEce01fjHxaelANtJ9U_FpLzUwBOBJz0eXLTmgPy-tMDi6uwD9I4ylUNDWjwV2HACLen9fuh-jDdDcPTjDJiWJwnM0FYZ2zSHZFbfnJuA/s1280/thumbnail.jpg"
}
// whatsapp send
export async function react(m, text) {
    if (!m?.key) throw Error('param 1 invalid. type nya message.')
    vSingleEmoji(text)
    return await sock.sendMessage(m.key.remoteJid, {
        react: {
            text: text,
            key: m.key
        }
    })
}

export async function sendText(jid, text, replyTo) {
    vString(jid, "param 1 (jid)")
    vString(jid, "param 2 (text)")
    return await sock.sendMessage(jid, { text }, { quoted: replyTo })
}

export async function sendMp3(jid, urlOrBuffer, replyTo) {
    vString(jid, "param 1 jid")
    let content = null
    if (Buffer.isBuffer(urlOrBuffer)) {
        content = urlOrBuffer
    } else {
        vString(urlOrBuffer, "param 2 url")
        content = { url: urlOrBuffer }
    }

    return await sock.sendMessage(jid, {
        audio: content,
        mimetype: 'audio/mpeg'
    }, { quoted: replyTo })

}

function resolveContent(input) {
    let content = null
    if (Buffer.isBuffer(input)) {
        // Buffer langsung
        console.log('diperlakukan sebagai buffer')
        content = input
    }
    else if (input instanceof Readable) {
        // Stream langsung → wajib bungkus { stream }
        console.log('diperlakukan sebagai stream')
        content = { stream: input }
    }
    else if (typeof input === "string") {
        if (/^https?:\/\//.test(input)) {
            // URL: fetch otomatis oleh Baileys
            console.log('diperlakukan sebagai url stream')
            content = { url: input }
        }
        else if (fs.existsSync(input)) {
            // File path lokal
            const stream = fs.createReadStream(input)
            content = { stream }
        }
        else {
            throw new Error(`(content input) tidak valid: ${input}`)
        }
    }
    else {
        throw new Error("(content input) harus Buffer, Stream, atau URL/path string")
    }
    return content
}

export async function sendFancyMp3(jid, audioInput, title = '(empty)', body = '(empty)', thumbnailUrlOrBuffer = '', renderSmallThumbnail = false, replyTo) {
    vString(jid, "param 1 jid")

    const content = resolveContent(audioInput)
    // thumbnail
    let thumbnailContent = {}
    if (Buffer.isBuffer(thumbnailUrlOrBuffer)) {
        thumbnailContent = { thumbnail: thumbnailUrlOrBuffer }
    } else {
        const url = thumbnailUrlOrBuffer || value?.thumbnailUrl
        thumbnailContent = { thumbnailUrl: url }
    }

    let externalAdReply = {
        title,
        body,
        mediaType: 1,
        renderLargerThumbnail: !renderSmallThumbnail,
        ...thumbnailContent
    }

    return await sock.sendMessage(jid, {
        audio: content,
        mimetype: 'audio/mpeg',
        contextInfo: { externalAdReply }
    }, { quoted: replyTo })
}


export async function sendFancyText(jid, text, title = '(empty)', body = '(empty)', thumbnailUrlOrBuffer = '', renderLargerThumbnail = true, replyTo) {
    vString(jid, "param 1 jid")
    vString(text, "param 2 text")

    // param 5 resolve (thumbnail)

    let thumbnailContent = {}
    if (Buffer.isBuffer(thumbnailUrlOrBuffer)) {
        thumbnailContent = { thumbnail: thumbnailUrlOrBuffer }
    } else {
        const url = thumbnailUrlOrBuffer || value.thumbnailUrl
        thumbnailContent = { thumbnailUrl: url }
    }
    let externalAdReply = {
        title,
        body,
        mediaType: 1,
        renderLargerThumbnail,
    }

    externalAdReply = Object.assign(externalAdReply, thumbnailContent)

    return await sock.sendMessage(jid, {
        text,
        contextInfo: { externalAdReply }
    }, { quoted: replyTo })

}

export async function sendImage(jid, urlOrBuffer, caption, replyTo) {
    vString(jid, "param 1 jid")
    let content = null
    if (Buffer.isBuffer(urlOrBuffer)) {
        content = urlOrBuffer
    } else {
        vString(urlOrBuffer, "param 2 url")
        content = { url: urlOrBuffer }
    }

    return await sock.sendMessage(jid, {
        image: content,
        caption
    }, { quoted: replyTo })
}

export async function sendVideo(jid, urlOrBuffer, caption, replyTo) {
    vString(jid, "param 1 jid")
    let content = null
    if (Buffer.isBuffer(urlOrBuffer)) {
        content = urlOrBuffer
    } else {
        vString(urlOrBuffer, "param 2 url")
        content = { url: urlOrBuffer }
    }

    return await sock.sendMessage(jid, {
        video: content,
        caption
    }, { quoted: replyTo })
}

export async function sendDocument(jid, urlOrBuffer, fileName, mimetype = 'bin', caption, replyTo) {
    vString(jid, "param 1 jid")
    let content = null
    if (Buffer.isBuffer(urlOrBuffer)) {
        content = urlOrBuffer
    } else {
        vString(urlOrBuffer, "param 2 url")
        content = { url: urlOrBuffer }
    }

    return await sock.sendMessage(jid, {
        document: content,
        mimetype,
        fileName,
        caption
    }, { quoted: replyTo })
}

export async function editText(jid, m, text) {
    vString(jid, 'param 1 jid')
    vString(text, 'param 3 text')
    return await sock.sendMessage(jid, {
        text,
        edit: m.key
    })
}

export async function forward(jid, webMessageInfo, hideForwardLabel, replyTo) {
    vString(jid, 'param 1 jid')
    const content = {
        forward: webMessageInfo,
    }
    if (hideForwardLabel) Object.assign(content, { contextInfo: { isForwarded: false } })
    return await sock.sendMessage(jid, content, { quoted: replyTo })
}

export async function setBotLabel(jid, label) {
    const payload = {
        "protocolMessage": {
            "type": 30,
            "memberLabel": {
                "label": label,
                "labelTimestamp": getSecondNow()
            }
        }
    }
    return await sock.relayMessage(jid, payload, {})
}

// whatsapp related util
export async function getBuff(m) {
    return await downloadMediaMessage(m, "buffer")
}

export async function _getPn(lid) {
    vString(lid, "param 1 perlu lid")
    if (!isLidUser(lid)) throw Error(`${lid} musti valid lid bro.`)
    return jidNormalizedUser(await sock.signalRepository.lidMapping.getPNForLID(lid))
}

export async function getPn(groupJid, lid) {
    if (!isJidGroup(groupJid)) throw Error('jid musti grup')
    if (isJidUser(lid)) return lid
    if (!isLidUser(lid)) throw Error('invalid lid user')
    const gm = await store.getGroupMetadata(groupJid)
    //const gm = store.groupMetadata.get(groupJid)
    if (!gm) return null
    const find = gm.participants.find(p => p.id === lid)
    if (find) return find.phoneNumber
}

// for baileys 6.x
export async function getLid(groupJid, pn) {
    if (!isJidGroup(groupJid)) throw Error('jid musti grup')
    if (isLidUser(pn)) return pn
    if (!isJidUser(pn)) throw Error('invalid pn user')
    const gm = await store.getGroupMetadata(groupJid)
    const find = gm.participants.find(p => p.jid === pn)
    if (find) return find.lid
}

export function getMime(m) {
    try {
        const mimetype = m.message[m.type].mimetype
        const split = mimetype.split("/")
        const type = split[0]
        const ext = "." + split[1]
        return { mimetype, type, ext }
    } catch (e) {
        console.log(e)
        return null
    }
}

export function tag(lid) {
    return '@' + lid.split('@')[0]
}

export function textOnlyMessage(m) {
    if (m.type === "extendedTextMessage") return true
    if (m.type === "conversation") return true
    return false
}

export function commandOnly(m, text) {
    if (text) return false
    if (m.q) return false
    if (!textOnlyMessage(m)) return false
    return true
}

// general util

export function extractUrl(text) {
    const urlRegex = /https?:\/\/(?:\[[^\]]+\]|[A-Za-z0-9\-._~%]+(?:\.[A-Za-z0-9\-._~%]+)*)(?::\d{1,5})?(?:[/?#][^\s"'<]*)?/gi;
    const raw = text.match(urlRegex) || [];

    // bersihkan trailing punctuation yang sering muncul di teks: . , ; : ! ? ) ] " '
    const cleaned = raw.map(u => {
        // hapus penutup kurung/quote/tanda baca berulang di akhir
        return u.match(/http([^\s\\]+)/g)?.[0];
    });

    // optional: validasi benar-benar URL (mengeliminasi false positives)
    return cleaned.filter(s => {
        try {
            new URL(s); // akan throw kalau bukan url valid
            return true;
        } catch (e) {
            return false;
        }
    });
}

export async function downloadBuffer(url) {
    const r = await fetch(url)
    if (!r.ok) throw Error(`${r.status} ${r.statusText} pas donlot buffer`)
    const ab = await r.arrayBuffer()
    const buffer = Buffer.from(ab)
    return buffer
}

export async function downloadStream(url, headers = {}) {
    const r = await fetch(url, { headers })
    if (!r.ok) throw Error(`${r.status} ${r.statusText} di method downloadStream`)
    const stream = Readable.fromWeb(r.body)
    return stream
}

export function formatByte(bytes, decimals = 2) {
    if (bytes === 0) return '0 B';
    if (!Number.isFinite(bytes)) return 'Invalid';

    const k = 1024; // dasar binary
    const dm = decimals < 0 ? 0 : decimals;

    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function loadJson(path) {
    const jsonString = fs.readFileSync(path)
    console.log(`📤 load json: ${path}`)
    return JSON.parse(jsonString)
}

export function saveJson(json, path) {
    const jsonString = JSON.stringify(json, null, 2)
    fs.writeFileSync(path, jsonString)
    console.log(`💾 save json: ${path}`)
}

export function msToReadableTime(ms) {

    if (isNaN(parseInt(ms))) return 'invalid ms value'

    let d = 0, h = 0, m = 0, s = 0
    const satuHari = 1000 * 60 * 60 * 24
    const satuJam = 1000 * 60 * 60
    const satuMenit = 1000 * 60
    const satuDetik = 1000

    while (ms >= satuHari) {
        d++
        ms -= satuHari
    }
    while (ms >= satuJam) {
        h++
        ms -= satuJam
    }
    while (ms >= satuMenit) {
        m++
        ms -= satuMenit
    }
    while (ms >= satuDetik) {
        s++
        ms -= satuDetik
    }
    d = d ? d + ' hari ' : ''
    h = h ? h + ' jam ' : ''
    m = m ? m + ' menit ' : ''
    s = s ? s + ' detik ' : ''
    let result = d + h + m + s
    if (!result) result = '< 1 detik'
    return result.trim()
}

export function vSingleEmoji(inputString) {
    if (!/^(?:\p{RGI_Emoji}|\s*)$/v.test(inputString)) {
        throw Error(`${inputString} invalid emoji, 1 emoji ajah.`)
    }
}

export function vString(inputString, paramName = "param") {
    if (typeof (inputString) !== 'string' || !inputString.trim()) {
        throw Error(`${paramName} harus string dan gak boleh kosong.`)
    }
}

export function log(name, ...params) {
    console.log('[log] ' + name, ...params)
}


export function getErrorLine(errorStack) {
    return errorStack.match(/t=\d+:(\d+):/)?.[1]
}

export function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)]
}

export async function getContentTypeFromUrl(url) {
    try {
        const r = await fetch(url, {
            method: 'get'
        })
        return r.headers.get('content-type')?.split('; ')?.[0]
    } catch (_) {
        return undefined
    }
}

export function getSecondNow() {
    return Math.floor(Date.now() / 1000)
}

export function shuffleArray(array) {
    if (!Array.isArray(array)) throw ('gagal shuffle array. karena param bukan array')

    // source : https://bost.ocks.org/mike/shuffle/
    // While there remain elements to shuffle…
    let m = array.length, t, i;
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
}

export function pickWords (string){
    return string.match(/\S+/g)
}


export function consoleMessage(m, q) {
    let pQuoted = ''
    let qsymbol = ''
    const separator = '\n'
    if (q) {
        const pQName = `[${q.pushName}] `
        const pQSenderId = `[${q.senderId}] `
        const pQType = `[${q.type}] `
        const pQText = `${q.text ? '\n' + q.text : ''}`
        pQuoted = '[Q] ' + pQName + pQType + pQSenderId + pQText + '\n'
        qsymbol = '⤷ '
    }
    const pChat = `${store.groupMetadata.get(m.chatId)?.subject || m.chatId} [${m.chatId}]\n`
    const pName = `[${m.pushName}] `
    const pSenderId = `[${m.senderId}] `
    const pType = `[${m.type}] `
    const pText = `${m.text ? '\n' + m.text : ''}`
    return pChat + pQuoted + qsymbol + '[M] ' + pName + pType + pSenderId + pText + separator
}

export function pluginHelpSerialize(handler) {
    const emptyPlaceholder = '(tidak ada)'
    const header = `*📖 dokumentasi plugin*\n\n`
    const name = `*plugin name*\n${handler.pluginName}\n\n`
    const category = `*category*\n${handler.category.join(', ') || emptyPlaceholder}\n\n`
    const command = `*command*\n${handler.command.join(', ')}\n\n`
    const alias = `*alias*\n${handler.alias.join(', ') || emptyPlaceholder}\n\n`
    const needPrefix = `*bypass prefix*\n${handler.bypassPrefix ? 'yes' : 'no'}\n\n`
    const desc = `*description*\n${handler.help || emptyPlaceholder}\n\n`
    const dir = `*lokasi plugin*\n${handler.dir}`
    return header + name + desc + command + alias + category + needPrefix + dir
}

export class Category {
    static BOT = 'bot'
    static OTHER = 'other'
    static OWNER = 'owner'
    static DEBUG = 'debug'
}