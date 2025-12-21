import { sendFancyText, Category } from './../helper.js'

async function handler({ jid }) {
  const text = `
╭───〔 *KIRA* 〕───
│
│  *Wolep*
│ └ kink
│ 
│  *Kado*
│ └ penyedia plugin
│
│ *Shaq*
│ └ hama
╰──────────────
> thanks cuy
  `

  await sendFancyText(
    jid,
    text.trim(),
    'Thank U',
    'Credits',
    'https://files.catbox.moe/jeyyw1.jpeg',
    true,
    null
  )
}

handler.pluginName = 'intinya ini tqto'
handler.command = ['tqto']
handler.alias = []
handler.category = [Category.OTHER]
handler.help = 'credits'

export default handler