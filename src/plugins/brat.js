import { Category, downloadBuffer, sendText } from './../helper.js'
import sharp from 'sharp'

async function handler({ m, text, jid, sock }) {
    if (!text) return sendText(jid, 'masukkan teks', m)

    const url = 'https://api.deline.web.id/maker/brat?text=' + encodeURIComponent(text)
    const img = await downloadBuffer(url)

    const webp = await sharp(img)
        .resize(512, 512, { fit: 'contain' })
        .webp({ quality: 80 })
        .toBuffer()

    await sock.sendMessage(jid, { sticker: webp }, { quoted: m })
}

handler.pluginName = 'brat sticker'
handler.command = ['brat']
handler.alias = []
handler.category = [Category.GENERATOR]
handler.help = 'buat stiker brat (webp)'

export default handler