import { sendText, Category } from '../helper.js'
import { isJidGroup } from 'baileys'

async function handler({ m, jid, text, sock }) {
    if (!isJidGroup(jid)) return sendText(jid, 'khusus grup', m)
    if (!text) return sendText(jid, 'masukkan teks', m)

    const metadata = await sock.groupMetadata(jid)
    const members = metadata.participants.map(v => v.id)

    return await sock.sendMessage(
        jid,
        {
            text,
            mentions: members
        },
        { quoted: m }
    )
}

handler.pluginName = 'hidetag'
handler.command = ['hidetag', 'ht']
handler.alias = []
handler.category = [Category.GROUP]
handler.help = 'mention semua member tanpa terlihat'

export default handler