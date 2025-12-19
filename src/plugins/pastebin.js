import axios from "axios"
import { sendText, commandOnly, Category } from './../helper.js'
import { sock } from '../../index.js'

async function handler({ m, text, jid, command }) {
  if (commandOnly(m, text)) 
    return await sendText(
      jid,
      `Contoh penggunaan:\n${command} https://pastebin.com/5QmxbPGG`,
      m
    )

  try {
    let pasteId
    if (text.includes("pastebin.com")) {
      const match = text.match(/pastebin\.com\/([a-zA-Z0-9]+)/)
      if (!match) return await sendText(jid, "URL Pastebin tidak valid.", m)
      pasteId = match[1]
    } else {
      pasteId = text.trim()
    }

    const rawUrl = `https://pastebin.com/raw/${pasteId}`

    const { data, status } = await axios.get(rawUrl)
    if (status !== 200 || !data) 
      return await sendText(jid, "Gagal mengambil konten Pastebin.", m)

    const preview = data.length > 3000 ? data.slice(0, 3000) + "\n\n[Isi file terlalu panjang, dipotong]" : data

    await sock.sendMessage(jid, { text: preview })

  } catch (e) {
    console.error(e)
    await sendText(jid, "⚠️ Error saat fetch Pastebin, cek URL-nya.", m)
  }
}

handler.pluginName = "Get Pastebin"
handler.command = ["pastebin"]
handler.alias = []
handler.category = [Category.TOOL]
handler.help = "Mengambil konten Pastebin (raw) dan kirim teks"

export default handler