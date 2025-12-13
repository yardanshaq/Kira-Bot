import { sendText, tag, Category } from '../helper.js'

/**
 * @param {Object} params
 * @param {import("baileys").WASocket} params.sock
 */

async function handler({ sock, jid, text, m, q, prefix, command }) {

    const header = `hai!\n`
    const pushName = `ini pushname kamu: ${m.pushName}\n`
    const id = `ini id kamu (biasanya lid): ${m.senderId}\n`
    const tagUser = `dan ini tag kamu (tag otomatis msg patch) ${tag(m.senderId)}\n`
    const teksmu = `dan ini teks mu: ${text || `(kebetulan kamu gak ngirim teks tambahan jadi gak ada)`}\n`
    const prefixmu = `ini prefix mu: ${prefix || `(gak makek prefix alias null)`}\n`
    const commandmu = `dan ini command mu: ${command}`
    const print = header + pushName + id + tagUser + teksmu + prefixmu + commandmu
    return await sendText(jid, print, m)
}

handler.bypassPrefix = false
handler.pluginName = 'example title'
handler.command = ['example']
handler.alias = ['eg']
handler.category = [Category.OTHER]
handler.help = 'taruh deskripsi kamu disini'

export default handler


