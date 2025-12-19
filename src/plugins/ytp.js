import {delay} from 'baileys'
import axios from 'axios'
import { sendText, commandOnly, Category, sendFancyMp3, react } from './../helper.js'
import { sock } from '../../index.js'
async function handler({ m, text, jid, conn }) {
    if (commandOnly(m, text)) return await sendText(jid, 'query? atau judul nya?', m)

    try {
        react(m, "🕒")
        const url = `https://api.deline.web.id/downloader/ytplay?q=${encodeURIComponent(text)}`
        const res = await axios.get(url)
        const data = res.data

        if (!data.status || !data.result) {
            return await sendText(jid, data.message || 'tidak ada hasil ditemukan', m)
        }

        const { title, thumbnail, dlink, pick } = data.result
        
        await sendFancyMp3(jid, dlink, title, "Karudo", thumbnail)
        await delay(1500)
        return await react(m, "✅")

    } catch (error) {
        await sendText(jid, `terjadi kesalahan ${error.response?.data?.message || error.message}`, m)
    }
}

handler.pluginName = 'youtube play with api'
handler.command = ['ytp']
handler.alias = ['play']
handler.category = [Category.DOWNLOADER]
handler.help = 'download audio youtube dengan thumbnail'

export default handler