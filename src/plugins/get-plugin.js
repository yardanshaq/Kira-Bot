import { plugins, pluginsNoPrefix, user } from '../../index.js'
import { sendText, sendDocument, tag, Category } from '../helper.js'
import fs from 'node:fs'

async function hum(jid, m, buff, fileName, senderId, pluginName) {
    const isReply = m.q
    const msg = isReply ? `🔖 kamu di berikan plugin *${pluginName}* oleh ${tag(senderId)}\nhappy coding!` : `nih plugin *${pluginName}* nya`
    const replyTo = isReply ? m.q : undefined
    return await sendDocument(jid, buff, fileName, 'text/javascript', msg, replyTo)
}

async function handler({ sock, m, text, jid, prefix, command }) {

    if (!user.trustedJids.has(m.senderId)) return

    const footer = 'ketik `' + command + ' -h` untuk bantuan.'

    if (!text) return await sendText(jid, `mau dikirimin plugin apa?\n\n${footer}`)

    let han = plugins.get(text)
    if (han) {
        const name = han.pluginName
        const buff = fs.readFileSync(han.dir)
        const fileName = han.dir.split('/').pop()
        return await hum(jid, m, buff, fileName, m.senderId, name)
    }

    han = pluginsNoPrefix.get(text)
    if (han) {
        const name = han.pluginName
        const buff = fs.readFileSync(han.dir)
        const fileName = han.dir.split('/').pop()
        return await hum(jid, m, buff, fileName, m.senderId, name)
    }

    return await sendText(jid, 'tidak ditemukan plugin dengan command atau alias `' + text + '`', m)
}

//handler.bypassPrefix = true

handler.pluginName = 'get plugin'
handler.command = ['getPlugin']
handler.alias = ['gp']
handler.category = [Category.BOT]
handler.help = `buat ngirim file plugin js ke chat.\n\n` +
    `cara pakai\n> ${handler.command} <command|alias>`

export default handler


