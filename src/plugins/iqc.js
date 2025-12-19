import { sendText, downloadBuffer, Category } from './../helper.js'
import { sock } from '../../index.js'

async function handler({ m, text, jid }) {
    if (!text) return sendText(jid, 'Format: .iqc teks|chatTime|statusBarTime', m)

    // split input berdasarkan |
    const [iqcText, chatTime = '22:11', statusBarTime = '22:20'] = text.split('|').map(t => t.trim())

    if (!iqcText) return sendText(jid, 'Masukkan teks untuk IQC', m)

    try {
        const apiUrl = `https://api.deline.web.id/maker/iqc?text=${encodeURIComponent(iqcText)}&chatTime=${encodeURIComponent(chatTime)}&statusBarTime=${encodeURIComponent(statusBarTime)}`

        const buffer = await downloadBuffer(apiUrl)

        await sock.sendMessage(jid, { image: buffer, caption: `Succesfully created iqc\n> Karudo` }, { quoted: m })

    } catch (err) {
        console.error(err)
        sendText(jid, 'Terjadi kesalahan saat membuat gambar IQC', m)
    }
}

handler.pluginName = 'iqc maker'
handler.command = ['iqc']
handler.alias = []
handler.category = [Category.GENERATOR]
handler.help = 'buat gambar IQC dari teks dengan format .iqc teks|chatTime|statusBarTime'

export default handler