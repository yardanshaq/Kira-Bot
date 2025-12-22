import axios from 'axios'
import { sock } from '../../index.js'
import { sendText, commandOnly, Category } from '../helper.js'

async function handler({ m, jid, text }) {
  if (commandOnly(m, text))
    return sendText(jid, 'mana url nya', m)

  try {
    const targetUrl = text.trim()
    if (!/^https?:\/\//i.test(targetUrl))
      return sendText(jid, 'url tidak valid', m)

    const apiUrl =
      'https://api.deline.web.id/tools/screenshot?url=' +
      encodeURIComponent(targetUrl)

  
    const res = await axios.get(apiUrl, {
      responseType: 'arraybuffer'
    })

    const buffer = Buffer.from(res.data)

    await sock.sendMessage(
      jid,
      {
        image: buffer,
        caption: `${targetUrl}\n> Kira`
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    sendText(jid, '❌ gagal mengambil screenshot', m)
  }
}

handler.pluginName = 'screenshot website atau domain atau situs atau gatau wkwk'
handler.command = ['ss', 'ssweb']
handler.alias = []
handler.category = [Category.TOOL]
handler.help = 'Screenshot website\nContoh: ssweb https://google.com'

export default handler