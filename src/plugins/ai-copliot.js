/**
 * » Fitur    : AI Copilot
 * » Type     : Plugin ESM
 * » API      : https://api.deline.web.id
 */

import axios from "axios"
import { sendText, Category, commandOnly } from "./../helper.js"

async function handler({ m, jid, text }) {
  if (commandOnly(m, text))
    return sendText(jid, 'contoh:\ncopilot sekarang hari apa', m)

  try {
    const url = `https://api.deline.web.id/ai/copilot?text=${encodeURIComponent(text)}`
    const { data } = await axios.get(url, {
      headers: {
        'user-agent': 'Mozilla/5.0',
        accept: 'application/json'
      }
    })

    if (!data.status || !data.result)
      throw 'AI tidak merespon'

    await sendText(jid, data.result, m)

  } catch (e) {
    console.error(e)
    await sendText(jid, '❌ gagal memanggil copilot ai', m)
  }
}

handler.pluginName = 'ai-copilot'
handler.command = ['copilot']
handler.alias = []
handler.category = [Category.AI]
handler.help = 'copilot <pertanyaan>'

export default handler