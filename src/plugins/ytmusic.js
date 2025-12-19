import axios from 'axios'
import { sendText, commandOnly, Category } from './../helper.js'
import { sock } from '../../index.js'

async function handler({ m, text, jid }) {
    if (commandOnly(m, text)) return await sendText(jid, 'Masukkan URL YouTube nya!', m)

    try {
        const apiUrl = `https://api.deline.web.id/downloader/ytmp3?url=${encodeURIComponent(text)}`
        const res = await axios.get(apiUrl)
        const data = res.data

        if (!data.status || !data.result) {
            return await sendText(jid, data.message || 'Tidak ada hasil ditemukan', m)
        }

        const { title, thumbnail } = data.result.youtube
        const { dlink, pick } = data.result

        await sock.sendMessage(jid, {
            audio: { url: dlink },
            fileName: `${title}.${pick.ext}`,
            mimetype: 'audio/mpeg',
            contextInfo: { 
                externalAdReply: { 
                    title, 
                    mediaUrl: text, 
                    thumbnailUrl: thumbnail 
                } 
            }
        }, { quoted: m })

    } catch (error) {
        await sendText(jid, `Terjadi kesalahan: ${error.response?.data?.message || error.message}`, m)
    }
}

handler.pluginName = 'YouTube MP3 Downloader'
handler.command = ['ytmp3']
handler.alias = ['mp3']
handler.category = [Category.DOWNLOADER]
handler.help = 'Download YouTube audio mp3, contoh: ytmp3 <link>'

export default handler