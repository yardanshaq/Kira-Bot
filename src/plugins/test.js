import { sock } from '../../index.js'
import { sendText, tag,Category } from '../helper.js'

async function handler({_sock, m,  text, jid, prefix, command }) {

    return await sock.sendMessage(jid, {text: "plugin ini dari hot reload"})
}

//handler.bypassPrefix = true

handler.pluginName = 'test'
handler.command = ['test']
handler.alias = []
handler.category = [Category.OTHER]
handler.help = 'taruh deskripsi kamu disini'

export default handler


