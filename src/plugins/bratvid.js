import { Category, downloadBuffer, sendText } from './../helper.js'
import { Sticker } from 'wa-sticker-formatter'

async function handler({ m, text, jid, sock }) {
    if (!text) return sendText(jid, 'masukkan teks', m)

    const url = 'https://api.deline.web.id/maker/bratvid?text=' + encodeURIComponent(text)
    const mp4 = await downloadBuffer(url)

    const sticker = new Sticker(mp4, {
        pack: 'Karudo 🥀',
        author: 'BratVid',
        animated: true,
        quality: 70
    })

    const webp = await sticker.toBuffer()
    await sock.sendMessage(jid, { sticker: webp }, { quoted: m })
}

handler.pluginName = 'brat sticker anim'
handler.command = ['bratvid']
handler.alias = []
handler.category = [Category.GENERATOR]
handler.help = 'buat stiker brat video'

export default handler