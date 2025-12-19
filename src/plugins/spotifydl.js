import axios from 'axios'
import { sendText, commandOnly, Category } from './../helper.js'
import { sock } from '../../index.js'

async function handler({ m, text, jid }) {
    if (commandOnly(m, text)) {
        return await sendText(jid, 'Masukkan URL Spotify nya!', m)
    }

    try {
        const apiUrl = `https://api.elrayyxml.web.id/api/downloader/spotify?url=${encodeURIComponent(text)}`
        const res = await axios.get(apiUrl)
        const data = res.data

        if (!data.status || !data.result) {
            return await sendText(jid, 'Gagal mengambil data Spotify', m)
        }

        const { title, artist, url } = data.result

        await sock.sendMessage(jid, {
            audio: { url },
            mimetype: 'audio/mpeg',
            fileName: `${title} - ${artist}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: `${title}`,
                    body: `Artist: ${artist}`,
                    mediaUrl: text,
                    sourceUrl: text
                }
            }
        }, { quoted: m })

    } catch (error) {
        await sendText(
            jid,
            `Terjadi kesalahan: ${error.response?.data?.message || error.message}`,
            m
        )
    }
}

handler.pluginName = 'Spotify Downloader'
handler.command = ['spdl']
handler.alias = ['spotifydl']
handler.category = [Category.DOWNLOADER]
handler.help = 'Download audio Spotify, contoh: spdl <link>'

export default handler