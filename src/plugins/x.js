import axios from 'axios'
import { sendText, commandOnly, Category } from './../helper.js'
import { sock } from '../../index.js'

async function handler({ m, text, jid }) {
    if (commandOnly(m, text)) {
        return await sendText(jid, 'Masukkan URL Twitter / X nya!', m)
    }

    try {
        const res = await axios.get(
            'https://api.ootaizumi.web.id/downloader/twitter',
            {
                params: {
                    url: text.trim()
                }
            }
        )

        const data = res.data

        if (!data.status || !Array.isArray(data.result) || data.result.length === 0) {
            return await sendText(jid, 'Media tidak ditemukan', m)
        }

        // kirim semua media (image / video kalau ada)
        for (const item of data.result) {
            if (item.type === 'image') {
                await sock.sendMessage(
                    jid,
                    { image: { url: item.link } },
                    { quoted: m }
                )
            } else if (item.type === 'video') {
                await sock.sendMessage(
                    jid,
                    { video: { url: item.link } },
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

handler.pluginName = 'X / Twitter Downloader'
handler.command = ['x', 'twitter']
handler.alias = ['tw', 'twit']
handler.category = [Category.DOWNLOADER]
handler.help = 'Download media dari Twitter/X. Contoh: x https://twitter.com/...'

export default handler