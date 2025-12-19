import axios from 'axios'
import { sendText, commandOnly, Category } from './../helper.js'
import { sock } from '../../index.js'

async function handler({ m, text, jid }) {
    if (commandOnly(m, text)) {
        return await sendText(jid, 'query? atau judul nya?', m)
    }

    try {
        const res = await axios.get(
            'https://api.ootaizumi.web.id/downloader/spotifyplay',
            {
                params: {
                    query: text.trim()
                }
            }
        )

        const data = res.data

        if (!data.status || !data.result) {
            return await sendText(jid, 'tidak ada hasil ditemukan', m)
        }

        const {
            title,
            artists,
            image,
            external_url,
            download
        } = data.result

        // kirim thumbnail + audio
        await sock.sendMessage(jid, {
            audio: { url: download },
            mimetype: 'audio/mpeg',
            fileName: `${title} - ${artists}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: `${title}`,
                    body: artists,
                    mediaUrl: external_url,
                    sourceUrl: external_url,
                    thumbnailUrl: image
                }
            }
        }, { quoted: m })

    } catch (error) {
        await sendText(
            jid,
            `terjadi kesalahan ${error.response?.data?.message || error.message}`,
            m
        )
    }
}

handler.pluginName = 'spotify play with api'
handler.command = ['splay']
handler.alias = ['spotify']
handler.category = [Category.SEARCH]
handler.help = 'download audio spotify dengan cover, contoh: splay janji manis'

export default handler