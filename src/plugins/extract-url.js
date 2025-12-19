import { URL_REGEX } from 'baileys'
import { } from '../../index.js'
import { sendText, tag, extractUrl, Category } from '../helper.js'

async function handler({sock, m,  text, jid, prefix, command }) {
    const qm = m.q
    if(!qm) return await sendText(jid, 'reply ke pesan yang kamu mau extract url nya', m)
    const urls = extractUrl(qm.text)
    //const urls = Array.from(qm.text.matchAll(URL_REGEX))
    if(!urls.length) return await sendText(jid, `👻 boo... gak ada url di quoted nyah ${tag(m.senderId)}`, qm)
    const headers = `😸 ini link yang berhasil gw extract ${tag(m.senderId)}`
    const result = urls.map((v,i) => `${(i+1)} ${v}`).join('\n\n')
    const print = headers + '\n\n' + result
    return await sendText(jid, print, qm)
}

//handler.bypassPrefix = true

handler.pluginName = 'extract url'
handler.command = ['eu']
handler.alias = []
handler.category = [Category.TOOL]
handler.help = 'buat extract url. tapi cuma worek ke pesan yang di quoted / reply'

export default handler