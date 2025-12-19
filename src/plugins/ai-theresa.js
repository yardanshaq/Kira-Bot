import axios from 'axios'
import { sendText, commandOnly, Category } from './../helper.js'

async function handler({ m, text, jid, conn }) {
    if (commandOnly(m, text)) return await sendText(jid, 'Hai, masukkan pertanyaanmu dulu!', m)

    if (text.includes('~')) {
        return await sendText(jid, 'Karakter "~" tidak diperbolehkan.', m)
    }

    try {
        const url = `https://theresapisv3.vercel.app/ai/theresa?ask=${encodeURIComponent(text)}`
        const res = await axios.get(url)
        const data = res.data

        if (!data.status || !data.result) {
            return await sendText(jid, data.message || 'Tidak ada hasil ditemukan.', m)
        }

        let hasil = String(data.result).trim()
        hasil = hasil.replace(/~/g, '')

        await sendText(jid, hasil, m)

    } catch (error) {
        await sendText(jid, `Terjadi kesalahan: ${error.response?.data?.message || error.message}`, m)
    }
}

handler.pluginName = 'theresa'
handler.command = ['theresa']
handler.alias = []
handler.category = [Category.AI]
handler.help = 'Gunakan AI Theresa, contoh: theresa Hai, apa kabar?'

export default handler