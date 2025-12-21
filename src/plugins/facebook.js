import axios from 'axios'
import { sendText, commandOnly, Category } from './../helper.js'
import { sock } from '../../index.js'

async function handler({ m, text, jid }) {
    if (commandOnly(m, text)) {
        return await sendText(
            jid,
            'Masukkan URL Facebook!\ncontoh: fb https://www.facebook.com/xxxx',
            m
        )
    }

    try {
        const apiUrl = `https://api.nekolabs.web.id/downloader/facebook?url=${encodeURIComponent(text)}`
        const res = await axios.get(apiUrl)
        const data = res.data

        if (!data.success || !data.result || !data.result.medias?.length) {
            return await sendText(jid, 'Media Facebook tidak ditemukan', m)
        }

        const medias = data.result.medias

        // kirim semua media TANPA caption
        for (const media of medias) {
            if (!media.url) continue

            // IMAGE
            if (media.type === 'image') {
                await sock.sendMessage(
                    jid,
                    {
                        image: { url: media.url }
                    },
                    { quoted: m }
                )
            }

            // VIDEO
            else if (media.type === 'video') {
                await sock.sendMessage(
                    jid,
                    {
                        video: { url: media.url },
                        mimetype: 'video/mp4'
                    },
                    { quoted: m }
                )
            }
        }

    } catch (error) {
        await sendText(
            jid,
            `Terjadi kesalahan: ${error.response?.data?.message || error.message}`,
            m
        )
    }
}

handler.pluginName = 'Facebook Downloader'
handler.command = ['facebook', 'fb']
handler.alias = ['fbdown', 'fbdl']
handler.category = [Category.DOWNLOADER]
handler.help = 'Download media Facebook tanpa caption. Contoh: fb <link>'

export default handler