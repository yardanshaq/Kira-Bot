import { sendFancyText, Category } from './../helper.js'

async function handler({ jid }) {
  const text = `
╭───〔 *KARUDO* 〕───
│
│  *Wolep*
│ └ idol kado & base bot & kink wolep
│
│  *Zarr*
│ └ prennn kado yang bantu fitur
│
│  *Lupi*
│ └ gatau 🤍
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
    'Terima Kasih 💐',
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