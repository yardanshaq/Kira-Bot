import axios from 'axios'
import { sendText, commandOnly, Category } from './../helper.js'
import { sock } from '../../index.js'

async function handler({ m, text, jid }) {
    if (commandOnly(m, text)) return await sendText(jid, 'Masukkan URL Mediafire nya!', m)

    try {
        const apiUrl = `https://api.deline.web.id/downloader/mediafire?url=${encodeURIComponent(text)}`
        const res = await axios.get(apiUrl)
        const data = res.data

        if (!data.status || !data.result) {
            return await sendText(jid, data.message || 'Tidak ada hasil ditemukan', m)
        }

        const { fileName, downloadUrl } = data.result

        await sock.sendMessage(jid, {
            document: { url: downloadUrl },
            fileName: fileName,
            mimetype: 'application/zip',
            caption: '> Karudo'
        }, { quoted: m })

    } catch (error) {
        await sendText(jid, `Terjadi kesalahan: ${error.response?.data?.message || error.message}`, m)
    }
}

handler.pluginName = 'Mediafire Downloader'
handler.command = ['mf', 'mediafire']
handler.alias = []
handler.category = [Category.DOWNLOADER]
handler.help = 'Download file Mediafire, contoh: mf <link>'

export default handler