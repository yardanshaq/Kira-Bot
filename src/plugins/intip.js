import { sendText, getBuff, commandOnly, Category } from './../helper.js'

async function handler({ m, q, text, jid}) {
   if (!q) return await sendText(jid, 'reply ke dokumen message yang punya mime teks', m)
   
   const mime = q?.message?.[q.type]?.mimetype || ''
   const validMime = /^text/.test(mime)
   if(!validMime) return await sendText(jid, ' media message pls.. yg mime teks', m)
   const buffer = await getBuff(q)
   await sendText(jid, buffer + "", q)
   return
}

handler.pluginName = 'liat isi teks'
handler.command = ['intip']
handler.alias = []
handler.category = [Category.TOOL]
handler.help = 'buat liat teks.'

export default handler