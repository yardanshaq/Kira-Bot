import axios from 'axios'
import { sendText, commandOnly, Category } from './../helper.js'
import { sock } from '../../index.js'

async function handler({ m, text, jid }) {
    if (commandOnly(m, text)) {
        return await sendText(jid, 'Masukkan URL TikTok nya!', m)
    }

    try {
        const res = await axios.get(
            'https://api.ootaizumi.web.id/downloader/tiktok',
            {
                params: {
                    url: text.trim()
                }
            }
        )

        const data = res.data

        if (!data.status || !data.result) {
            return await sendText(jid, 'Tidak ada video ditemukan', m)
        }

        const {
            title,
            cover,
            hdplay,
            author
        } = data.result

        const nickname = author?.nickname || 'Unknown'

        await sock.sendMessage(
            jid,
            {
                video: { url: hdplay },
                caption: `🎬 ${title || 'TikTok Video'}\n👤 ${nickname}`,
                contextInfo: {
                    externalAdReply: {
                        title: title || 'TikTok',
                        body: nickname,
                        thumbnailUrl: cover,
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

handler.pluginName = 'TikTok Downloader'
handler.command = ['tiktok', 'tt']
handler.alias = ['ttdl']
handler.category = [Category.DOWNLOADER]
handler.help = 'Download video TikTok tanpa watermark. Contoh: tiktok <link>'

export default handler