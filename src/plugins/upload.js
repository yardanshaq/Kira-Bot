import { getBuff, getMime, tag, sendText, Category } from './../helper.js'
import tempFile from './../scrape/temp-files.js'
async function handler({ sock, m, text, jid, prefix, command }) {

    const mese = m.q ? m.q : m
    const buff = await getBuff(mese)
    const { ext } = getMime(mese)
    const result = await tempFile(buff, ext)
    return await sendText(jid, `${tag(m.senderId)} media berhasil di upload!\n${result.url}`, m.q)
}

handler.bypassPrefix = false
handler.pluginName = 'upload file'
handler.command = ['upload']
handler.alias = []
handler.category = [Category.OTHER]
handler.help = 'buat upload file'

export default handler