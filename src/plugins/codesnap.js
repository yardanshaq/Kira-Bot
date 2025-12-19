import axios from 'axios'
import { sendText, commandOnly, Category } from './../helper.js'
import { sock } from '../../index.js'

async function handler({ m, text, jid, q }) {
    if (commandOnly(m, text) && !q) {
        return await sendText(
            jid,
            'Masukkan kode atau reply pesan berisi kode!\ncontoh:\ncodesnap console.log("hello world")',
            m
        )
    }

    try {
        // ambil kode dari text atau reply
        let code = text
        if (q && (q.type === 'conversation' || q.type === 'extendedTextMessage')) {
            code = q.text
        }

        if (!code || !code.trim()) {
            return await sendText(jid, 'Kode tidak boleh kosong', m)
        }

        const res = await axios.get(
            'https://api.elrayyxml.web.id/api/maker/codesnap',
            {
                params: {
                    code: code.trim()
                },
                responseType: 'arraybuffer'
            }
        )

        const buffer = Buffer.from(res.data)

        await sock.sendMessage(
            jid,
            {
                image: buffer,
                caption: '📸 *CodeSnap*'
            },
            { quoted: m }
        )

    } catch (error) {
        await sendText(
            jid,
            `Terjadi kesalahan: ${error.response?.data?.message || error.message}`,
            m
        )
    }
}

handler.pluginName = 'CodeSnap'
handler.command = ['codesnap']
handler.alias = ['csnap', 'codeshot']
handler.category = [Category.TOOL]
handler.help = 'Buat gambar CodeSnap dari kode. Contoh: codesnap console.log("hello") atau reply kode'

export default handler