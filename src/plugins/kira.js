import axios from 'axios'
import { sendText, commandOnly, Category } from './../helper.js'

async function handler({ m, text, jid, conn }) {
    if (commandOnly(m, text)) return await sendText(jid, 'hai masukkan pertanyaanmu dulu', m)

    if (text.includes('~')) {
        return await sendText(jid, 'karakter ~ tidak diperbolehkan', m)
    }

    try {
        // API AI Karudo
        const url = `https://api.deline.web.id/ai/openai?text=${encodeURIComponent(text)}&prompt=kamu+adalah+kira+ai+cowo+yang+ramah+sopan+dan+menyenangkan+saat+diajak+berbicara+tidak+menggunakan+kapital+atau+tanda+baca+kecuali+di+akhir+pesan+gunakan+tanda+baca+titik`
        const res = await axios.get(url)
        const data = res.data

        if (!data.status || !data.result) {
            return await sendText(jid, data.message || 'tidak ada hasil ditemukan', m)
        }

        let hasil = String(data.result).trim()
        // hapus tanda ~ jika ada
        hasil = hasil.replace(/~/g, '')

        await sendText(jid, hasil, m)

    } catch (error) {
        await sendText(jid, `terjadi kesalahan ${error.response?.data?.message || error.message}`, m)
    }
}

handler.pluginName = 'simpel Kira ai with prompt'
handler.command = ['kira']
handler.alias = ['ai']
handler.category = [Category.AI]
handler.help = 'gunakan AI Kira cowok ramah sopan contoh: karudo hai bagaimana kabarmu'

export default handler