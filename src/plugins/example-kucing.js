import { tag, Category, sendImage } from '../helper.js'

async function handler({ jid, m }) {
    const api = 'https://cataas.com/cat?type=medium&position=center'
    return await sendImage(jid, api, `ini kucing nya kak ${tag(m.senderId)}`, m)
}

handler.pluginName = 'example 2 cat image'
handler.command = ['kucing']
handler.alias = []
handler.category = [Category.OTHER]
handler.help = 'plugin example, send kucing images using api'

export default handler


