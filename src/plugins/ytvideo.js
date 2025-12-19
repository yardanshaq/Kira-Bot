import axios from 'axios'
import { sendText, commandOnly, Category } from './../helper.js'
import { sock } from '../../index.js'

async function handler({ m, text, jid }) {
    if (commandOnly(m, text)) {
        return await sendText(jid, 'Masukkan URL YouTube nya!', m)
    }

    try {
        const apiUrl = `https://api.elrayyxml.web.id/api/downloader/ytmp4?url=${encodeURIComponent(text)}`
        const res = await axios.get(apiUrl)
        const data = res.data

        if (!data.status || !data.result) {
            return await sendText(jid, 'Tidak ada hasil ditemukan', m)
        }

        const { title, thumbnail, url, format, duration } = data.result

        await sock.sendMessage(
            jid,
            {
                video: { url },
                fileName: `${title}.mp4`,
                mimetype: 'video/mp4',
                caption:
                    `🎬 *YouTube MP4*\n` +
                    `📌 ${title}\n` +
                    `🎞️ ${format}p | ⏱️ ${duration}s`,
                contextInfo: {
                    externalAdReply: {
                        title,
                        body: `YouTube MP4 • ${format}p`,
                        thumbnailUrl: thumbnail,
                        mediaUrl: text,
                        sourceUrl: text
                    }
                }
            },
            { quoted: m }
        )

    } catch (error) {
        await sendText(
            jid,
            `Terjadi kesalahan: ${error.response?.data?.message || error.message}`,
            m
        )
    }
}

handler.pluginName = 'YouTube MP4 Downloader'
handler.command = ['ytmp4']
handler.alias = ['mp4']
handler.category = [Category.DOWNLOADER]
handler.help = 'Download YouTube video MP4. Contoh: ytmp4 <link>'

export default handler