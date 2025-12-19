import fetch from "node-fetch"
import { sendText, commandOnly, Category } from './../helper.js'
import { sock } from '../../index.js'

async function handler({ m, text, jid, command }) {
    if (commandOnly(m, text)) 
        return await sendText(jid, `judul?`, m)

    try {
        const url = `https://api.zenzxz.my.id/api/tools/lirik?title=${encodeURIComponent(text)}`
        const res = await fetch(url)
        const json = await res.json()

        if (!json?.success || !json?.data?.result?.length) 
            return await sendText(jid, "⚠️ Lirik tidak ditemukan!", m)

        const song = json.data.result[0]
        const title = song.trackName || song.name || "tanpa judul"
        const artist = song.artistName || "tidak diketahui"
        const album = song.albumName || "-"
        const lyrics = song.plainLyrics || song.syncedLyrics || "tidak ada lirik"

        let caption = `
🎶 *LIRIK LAGU*

🎵 *Judul:* ${title}
🎤 *Artis:* ${artist}
💿 *Album:* ${album}
🕒 *Durasi:* ${Math.floor(song.duration || 0)} detik

──────────────────
${lyrics}
──────────────────
📡 *Source:* LRC Lib
`.trim()

        // kirim caption + thumbnail media preview
        await sock.sendMessage(jid, {
            image: { url: "https://files.catbox.moe/jeyyw1.jpeg" },
            caption,
            contextInfo: {
                externalAdReply: {
                    title: `${title} - ${artist}`,
                    body: "",
                    mediaUrl: "https://www.google.com/search?q=" + encodeURIComponent(title + " " + artist + " lyrics"),
                    thumbnailUrl: "https://files.catbox.moe/jeyyw1.jpeg",
                    sourceUrl: "https://www.google.com/search?q=" + encodeURIComponent(title + " " + artist + " lyrics"),
                }
            }
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        await sendText(jid, "⚠️ Gagal mengambil lirik. Coba judul lain ya!", m)
    }
}

handler.pluginName = 'search lirik lagu'
handler.command = ['lirik', 'lyrics']
handler.alias = []
handler.category = [Category.SEARCH]
handler.help = 'cari lirik lagu dengan preview thumbnail, contoh: lirik cup of joe multo'

export default handler