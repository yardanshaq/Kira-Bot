import { sendText, Category, msToReadableTime } from '../helper.js'
import os from 'node:os'


/**
 * @param {Object} params
 * @param {import("baileys").WASocket} params.sock
 */

async function handler({ jid, m }) {
   const ou = Math.floor(os.uptime()) * 1000
   const pu = Math.floor(process.uptime()) * 1000

   const pou = `os uptime: ${msToReadableTime(ou)}`
   const ppu = `bot uptime: ${msToReadableTime(pu)}\n`

   const print = ppu + pou
   return await sendText(jid, print, m)
}

handler.bypassPrefix = false
handler.pluginName = 'runtime'
handler.command = ['runtime']
handler.alias = ['rt']
handler.category = [Category.BOT]
handler.help = 'liat runtime program dan host'

export default handler


