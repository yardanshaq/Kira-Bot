import { tag, Category, sendImage } from '../helper.js'

async function handler({ jid, m }) {
    const api = 'https://api.deline.web.id/random/ba'
    return await sendImage(jid, api, `ini blue archive nya kak ${tag(m.senderId)}`, m)
}

handler.pluginName = 'random blue archive'
handler.command = ['ba']
handler.alias = []
handler.category = [Category.RANDOM]
handler.help = 'random image blue archive using api'

export default handler