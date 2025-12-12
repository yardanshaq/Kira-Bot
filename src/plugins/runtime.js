import {sendText, Category, msToReadableTime} from '../helper.js'
import os from 'node:os'

async function handler({sock, m,  text, jid, prefix, command }) {

   const ou = Math.floor(os.uptime()) * 1000
   const pu = Math.floor(process.uptime()) * 1000

   const pou = `os uptime: ${msToReadableTime(ou)}`
   const ppu = `bot uptime: ${msToReadableTime(pu)}\n`

   const print = ppu + pou
   return await sendText(jid, print, m)

}

//handler.bypassPrefix = true

handler.pluginName = 'runtime'
handler.command = ['runtime']
handler.alias = ['rt']
handler.category = [Category.OTHER]
handler.help = 'liat runtime program dan host'

export default handler


