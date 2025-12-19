import { sendText, downloadBuffer, Category } from './../helper.js'
import { sock } from '../../index.js'
import { Sticker } from 'wa-sticker-formatter'

async function handler({ m, text, jid }) {
    try {
        // ambil teks, warna, nama
        let [qcText, color, nama] = text ? text.split('|').map(t => t.trim()) : []
        qcText = qcText || 'Hello'
        color = color || 'white'
        nama = nama || m.pushName || 'User'

        // ambil avatar user dari WA profile (pengirim command)
        let avatarUrl
        try {
            avatarUrl = await sock.profilePictureUrl(m.sender, "image")
        } catch {
            avatarUrl = 'https://api.deline.web.id/ftMjT6WP1I.jpg' // fallback avatar
            console.error('Gagal ambil avatar, pakai fallback:', avatarUrl)
        }

        // buat URL API
        const apiUrl = `https://api.deline.web.id/maker/qc?text=${encodeURIComponent(qcText)}&color=${encodeURIComponent(color)}&avatar=${encodeURIComponent(avatarUrl)}&nama=${encodeURIComponent(nama)}`

        // download gambar
        const buffer = await downloadBuffer(apiUrl).catch(err => {
            console.error('Gagal download gambar QC:', err)
            throw new Error('Download QC gagal')
        })

        // buat stiker full tanpa crop
        const sticker = new Sticker(buffer, {
            pack: 'KadoKontol',
            author: 'Karudo🚀',
            type: 'full',
            crop: false,
            quality: 100
        })

        const webp = await sticker.toBuffer()
        await sock.sendMessage(jid, { sticker: webp }, { quoted: m })

    } catch (err) {
        console.error('Error handler QC:', err)
        sendText(jid, '⚠️ Terjadi kesalahan saat membuat stiker QC: ' + err.message, m)
    }
}

handler.pluginName = 'qc maker'
handler.command = ['qc']
handler.alias = []
handler.category = [Category.GENERATOR]
handler.help = 'Buat stiker QC full dari teks, warna, dan avatar WA (otomatis ambil pushName pengirim)'

export default handler