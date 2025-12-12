import { } from '../../index.js'
import { sendText, tag, Category } from '../helper.js'

async function handler({sock, m,  text, jid, prefix, command }) {

    if (text) return
    if (!m.q) return sendText(jid, 'reply command ' + command + ' ke pesan sekali lihat', m)
    const legitRvo = m.q.message[m.q.type].viewOnce
    if (!legitRvo) return sendText(jid, `hmm.. bukan pesan sekali liat ini mah ${tag(m.senderId)}`, m.q)
    m.q.message[m.q.type].viewOnce = false
    return sock.sendMessage(jid, { forward: m.q, contextInfo: {isForwarded: false}}, { quoted: m.q })
}

//handler.bypassPrefix = true
handler.pluginName = 'read view once'
handler.command = ['rvo']
handler.alias = []
handler.category = [Category.TOOL]
handler.help = 'melihat pesan view once'

export default handler