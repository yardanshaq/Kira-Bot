import { sendText, downloadBuffer, Category } from './../helper.js'
import { sock } from '../../index.js'
import fetch from 'node-fetch'

async function handler({ m, text, jid }) {
    if (!text) return sendText(jid, 'mana emoji nya anjg, emoji 🗿gabisa wkwk', m)

    try {
        // fetch API
        const apiUrl = 'https://api.deline.web.id/maker/emojigif?emoji=' + encodeURIComponent(text)
        const res = await fetch(apiUrl)
        const data = await res.json() // ambil JSON

        if (!data.status || !data.result?.url) 
            return sendText(jid, 'Gagal mendapatkan URL dari API', m)

        const mediaUrl = data.result.url // ambil key result.url

        // download file WEBP dari URL
        const buffer = await downloadBuffer(mediaUrl)

        // kirim sebagai stiker
        await sock.sendMessage(jid, { sticker: buffer }, { quoted: m })

    } catch (err) {
        console.error(err)
        sendText(jid, 'Terjadi kesalahan saat mengirim stiker', m)
    }
}

handler.pluginName = 'emoji sticker'
handler.command = ['emojisticker', 'emojigif']
handler.alias = []
handler.category = [Category.GENERATOR]
handler.help = 'buat stiker dari emoji atau teks'

export default handler