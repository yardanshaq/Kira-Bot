import axios from 'axios'
import { sendText, commandOnly, Category } from './../helper.js'
import { sock } from '../../index.js'

async function handler({ m, text, jid }) {
    if (commandOnly(m, text)) {
        return await sendText(
            jid,
            'Masukkan link media!\ncontoh:\naio https://open.spotify.com/track/xxxx',
            m
        )
    }

    try {
        const apiUrl = `https://api.elrayyxml.web.id/api/downloader/aio?url=${encodeURIComponent(text)}`
        const res = await axios.get(apiUrl)
        const data = res.data

        if (!data.status || !data.result || data.result.error) {
            return await sendText(jid, 'Gagal mengambil media', m)
        }

        const r = data.result
        const media = r.medias?.[0]

        if (!media || !media.url) {
            return await sendText(jid, 'Media tidak tersedia', m)
        }

        const caption =
            `🎧 *AIO Downloader*\n` +
            `📌 ${r.title}\n` +
            `👤 ${r.author}\n` +
            `⏱️ ${r.duration}\n` +
            `📦 Source: ${r.source}`

        // ===== AUDIO =====
        if (media.type === 'audio') {
            await sock.sendMessage(
                jid,
                {
                    audio: { url: media.url },
                    mimetype: 'audio/mpeg',
                    fileName: `${r.title}.${media.extension}`,
                    caption,
                    contextInfo: {
                        externalAdReply: {
                            title: r.title,
                            body: `${r.author} • ${media.quality}`,
                            thumbnailUrl: r.thumbnail,
                            mediaUrl: r.url,
                            sourceUrl: r.url
                        }
                    }
                },
                { quoted: m }
            )
        }

        // ===== VIDEO =====
        else if (media.type === 'video') {
            await sock.sendMessage(
                jid,
                {
                    video: { url: media.url },
                    mimetype: 'video/mp4',
                    fileName: `${r.title}.${media.extension || 'mp4'}`,
                    caption,
                    contextInfo: {
                        externalAdReply: {
                            title: r.title,
                            body: `${r.author}`,
                            thumbnailUrl: r.thumbnail,
                            mediaUrl: r.url,
                            sourceUrl: r.url
                        }
                    }
                },
                { quoted: m }
            )
        }

        // ===== UNKNOWN TYPE =====
        else {
            await sendText(jid, 'Tipe media tidak dikenali', m)
        }

    } catch (error) {
        await sendText(
            jid,
            `Terjadi kesalahan: ${error.response?.data?.message || error.message}`,
            m
        )
    }
}

handler.pluginName = 'AIO Downloader'
handler.command = ['aio']
handler.alias = ['allinone', 'alldl']
handler.category = [Category.DOWNLOADER]
handler.help = 'Download semua jenis media dari satu command. Contoh: aio <link>'

export default handler