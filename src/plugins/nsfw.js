import axios from 'axios'
import { tag, Category, sendText } from '../helper.js'

async function handler({ jid, m, text, sock }) {
    if (!text)
        return sendText(jid, 'pakai: nsfw <1-69>\ncontoh: nsfw 1', m)

    const cat = parseInt(text)
    if (isNaN(cat) || cat < 1 || cat > 69)
        return sendText(jid, 'kategori harus angka 1 - 69', m)

    try {
        // ambil json api
        const { data } = await axios.get(
            `https://api.deline.web.id/nsfw?cat=${cat}`
        )

        if (!data?.status || !data?.url)
            return sendText(jid, 'gagal ambil data nsfw', m)

        // ambil image sebagai STREAM
        const imgStream = await axios.get(data.url, {
            responseType: 'stream'
        })

        // kirim ke whatsapp (PAYLOAD BENAR)
        await sock.sendMessage(
            jid,
            {
                image: { stream: imgStream.data },
                caption: `ini nsfw kategori *${cat}* kak ${tag(m.senderId)}`
            },
            { quoted: m }
        )

    } catch (e) {
        return sendText(jid, 'error: ' + e.message, m)
    }
}

handler.pluginName = 'random nsfw by category'
handler.command = ['nsfw']
handler.alias = []
handler.category = [Category.RANDOM]
handler.help = 'random nsfw image by category (1-69)'

export default handler