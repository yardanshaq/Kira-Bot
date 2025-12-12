import { sock, store } from '../../index.js'
import { sendText, tag, Category, getPn } from '../helper.js'
import { createCanvas, loadImage } from '@napi-rs/canvas'


const safeTry = async (fn, ...param) => {
    try {
        return await fn(...param)
    } catch (_) {
        return null
    }
}

const generateImage = async function (targetUrl) {
    const canvas = createCanvas(1280, 720)
    const ctx = canvas.getContext('2d')

    const profilePic = await loadImage(targetUrl)
    const animePic = await loadImage('./src/assets/anime.webp')
    ctx.save() // simpan state awal 🎨

    // geser origin ke tengah gambar
    ctx.translate(400 + 250, 260 + 250)  // x + setengah width, y + setengah height
    ctx.rotate(-5 * Math.PI / 180)       // rotasi 30 derajat

    // gambar dengan posisi offset -setengah size (karena origin sudah dipindah)
    ctx.drawImage(profilePic, -250, -250, 500, 500)

    ctx.restore() // balikin state
    ctx.drawImage(animePic, -320, -140)

    const buffer = await canvas.encode('webp',{quality:50})
    return buffer
}

async function handler({ jid, text, m, q, prefix, command }) {

    const gm = await store.getGroupMetadata(jid)

    if (!q) return await sendText(jid, 'harus quoted', m)

    // picking profile picture url / group url
    let targetUrl = await safeTry(sock.profilePictureUrl, q.senderId, 'image')
    if (!targetUrl) targetUrl = await safeTry(sock.profilePictureUrl, m.chatId, 'image')
    if (!targetUrl) return sendText(jid, 'gagal mendapatkan foto profil / foto grup', m)

    // create thumbnail buffer
    const buff = await generateImage(targetUrl)

    const pn = await getPn(jid, q.senderId)
     await sock.sendMessage(jid, {
        text : `halo kak ${tag(q.senderId)} selamat bergabung ya.`,
        contextInfo: {
            externalAdReply: {
                title: 'new member!',
                body: `${gm.participants.length} person in this group now`,
                mediaType: 1,
                renderLargerThumbnail: true,
                thumbnail : buff,
                mediaUrl: 'https://wa.me/' + pn.split("@")[0] + '?text=' + encodeURIComponent('halo kak aku dari member ' + gm.subject + '. salken ya!'),
            }
        }
    })
}

//handler.bypassPrefix = true

handler.pluginName = 'test welcome'
handler.command = ['welcome']
handler.alias = []
handler.category = [Category.OTHER]
handler.help = 'taruh deskripsi kamu disini'

export default handler


