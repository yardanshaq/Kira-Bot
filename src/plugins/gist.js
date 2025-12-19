import axios from "axios"
import { sendText, commandOnly, Category } from './../helper.js'
import { sock } from '../../index.js'

async function handler({ m, text, jid, command }) {
  if (commandOnly(m, text)) 
    return await sendText(
      jid,
      `Contoh penggunaan:\n${command} https://gist.github.com/mifyow/0378b138de462bc116f383e7ea2014cd\natau githubuser:mifyow/0378b138de462bc116f383e7ea2014cd\natau raw URL langsung\n\nSupport: .txt, .js, .json, .jpg, .jpeg, .png, .mp3, .mp4`,
      m
    )

  let url = text.trim()

  try {
    // Normalize URL
    if (url.startsWith("githubuser:")) {
      const parts = url.replace("githubuser:", "").split("/")
      if (parts.length < 2) return await sendText(jid, "Format salah, contoh: githubuser:user/gistid", m)
      const user = parts[0]
      const gistId = parts[1]
      url = `https://gist.githubusercontent.com/${user}/${gistId}/raw`
    } else if (url.includes("gist.github.com") && !url.includes("/raw")) {
      const parts = url.split("/")
      const user = parts[3]
      const gistId = parts[4]
      url = `https://gist.githubusercontent.com/${user}/${gistId}/raw`
    } else if (url.includes("github.com") && url.includes("/blob/")) {
      url = url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/")
    }

    const ext = url.split(".").pop().toLowerCase()
    const isMedia = ["jpg","jpeg","png","mp3","mp4"].includes(ext)

    const { data, headers, status } = await axios.get(url, {
      responseType: isMedia ? "arraybuffer" : "text"
    })

    if (status !== 200 || !data) 
      return await sendText(jid, "Gagal mengambil isi file.", m)

    if (isMedia) {
      await sock.sendMessage(jid, {
        [ext === "mp3" ? "audio" : ext === "mp4" ? "video" : "image"]: {
          url,
          mimetype: headers["content-type"]
        }
      })
    } else {
      const textData = data.toString()
      const preview = textData.length > 3000 ? textData.slice(0, 3000) + "\n\n[Isi file terlalu panjang, dipotong]" : textData
      await sock.sendMessage(jid, { text: preview })
    }

  } catch (e) {
    console.error(e)
    await sendText(jid, "⚠️ Error saat fetch, cek URL-nya.", m)
  }
}

handler.pluginName = "Get Gist / File"
handler.command = ["gist"]
handler.alias = []
handler.category = [Category.TOOL]
handler.help = "Mengambil konten Gist, file GitHub raw, atau media (.jpg/.png/.mp3/.mp4)"

export default handler