import axios from 'axios'
import { sendText, commandOnly, Category, sendDocument } from './../helper.js'

async function handler({ m, text, jid }) {
    if (commandOnly(m, text)) {
        return await sendText(
            jid,
            'Masukkan URL repository GitHub!\ncontoh: gitclone https://github.com/WolfyFlutter/angelina-bot',
            m
        )
    }

    try {
        // 1️⃣ Hit API gitclone (JSON)
        const apiRes = await axios.get(
            'https://kyyokatsurestapi.my.id/downloader/gitclone',
            {
                params: { url: text.trim() }
            }
        )

        const data = apiRes.data

        if (!data.status || !data.result) {
            return await sendText(jid, 'Gagal clone repository', m)
        }

        const { owner, repo, download, filename } = data.result

        // 2️⃣ Download ZIP dari GitHub
        const zipRes = await axios.get(download, {
            responseType: 'arraybuffer'
        })

        const buffer = Buffer.from(zipRes.data)

        // 3️⃣ Kirim ZIP ke WhatsApp
        await sendDocument(
            jid,
            buffer,
            filename || `${repo}.zip`,
            'application/zip',
            `📦 Git Clone\nOwner: ${owner}\nRepo: ${repo}`,
            m
        )

    } catch (error) {
        await sendText(
            jid,
            `Terjadi kesalahan: ${error.response?.data?.message || error.message}`,
            m
        )
    }
}

handler.pluginName = 'Git Clone'
handler.command = ['gitclone']
handler.alias = ['git', 'clone']
handler.category = [Category.DOWNLOADER]
handler.help = 'Clone repository GitHub menjadi ZIP. Contoh: gitclone <url>'

export default handler