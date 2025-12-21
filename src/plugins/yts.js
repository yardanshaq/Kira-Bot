import axios from 'axios'
import { sendText, commandOnly, Category } from './../helper.js'

async function handler({ m, text, jid }) {
    if (commandOnly(m, text)) {
        return await sendText(
            jid,
            'Masukkan kata kunci pencarian!\ncontoh: yts the fate of ophelia',
            m
        )
    }

    try {
        const res = await axios.get(
            'https://api.ootaizumi.web.id/search/youtube',
            {
                params: {
                    query: text.trim()
                }
            }
        )

        const data = res.data

        if (!data.status || !Array.isArray(data.result) || data.result.length === 0) {
            return await sendText(jid, 'Hasil tidak ditemukan', m)
        }

        // ambil 5 hasil teratas
        const results = data.result.slice(0, 5)

        let list = results.map((v, i) => {
            return (
                `${i + 1}. ${v.title}\n` +
                `   Channel : ${v.author?.name || '-'}\n` +
                `   Durasi  : ${v.duration?.timestamp || v.timestamp || '-'}\n` +
                `   Views   : ${v.views?.toLocaleString?.() || v.views || '-'}\n` +
                `   Upload  : ${v.ago || '-'}\n` +
                `   Link    : ${v.url}`
            )
        }).join('\n\n')

        const output =
`🔎 *YouTube Search*
\`\`\`
${list}
\`\`\``

        await sendText(jid, output, m)

    } catch (error) {
        await sendText(
            jid,
            `Terjadi kesalahan: ${error.response?.data?.message || error.message}`,
            m
        )
    }
}

handler.pluginName = 'YouTube Search'
handler.command = ['yts', 'youtubesearch']
handler.alias = ['ytsearch', 'searchyt']
handler.category = [Category.SEARCH]
handler.help = 'Cari video YouTube. Contoh: yts the fate of ophelia'

export default handler