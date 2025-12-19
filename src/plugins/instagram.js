import axios from 'axios'
import { sendText, commandOnly, Category } from './../helper.js'
import { sock } from '../../index.js'

async function handler({ m, text, jid }) {
    if (commandOnly(m, text)) return await sendText(jid, 'Masukkan URL Instagram nya!', m)

    try {
        const apiUrl = `https://api.deline.web.id/downloader/ig?url=${encodeURIComponent(text)}`
        const res = await axios.get(apiUrl)
        const data = res.data

        if (!data.status || !data.result) {
            return await sendText(jid, data.message || 'Tidak ada hasil ditemukan', m)
        }

        const { media } = data.result

        // kalau ada gambar
        if (media.images && media.images.length > 0) {
            for (let imgUrl of media.images) {
                await sock.sendMessage(jid, {
                    image: { url: imgUrl },
                    caption: '> Karudo'
                }, { quoted: m })
            }

        // kalau ada video
        } else if (media.videos && media.videos.length > 0) {
            for (let vidUrl of media.videos) {
                await sock.sendMessage(jid, {
                    video: { url: vidUrl },
                    caption: '> Karudo'
                }, { quoted: m })
            }

        } else {
            return await sendText(jid, 'Media tidak ditemukan', m)
        }

    } catch (error) {
        await sendText(jid, `Terjadi kesalahan: ${error.response?.data?.message || error.message}`, m)
    }
}

handler.pluginName = 'Instagram Downloader'
handler.command = ['ig', 'instagram']
handler.alias = ['igdl']
handler.category = [Category.DOWNLOADER]
handler.help = 'Download foto/video Instagram, contoh: ig <link>'

export default handler