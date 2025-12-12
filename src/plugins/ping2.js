import { editText, Category as C } from '../helper.js'
import { sock } from '../../index.js'

async function handler({ jid }) {
   const start = Date.now()
   const pr = await sock.sendMessage(jid, { text: "wait..." })
   const end = Date.now()
   const result = `ping time: ${end - start}ms`
   editText(jid, pr, result)
   return
}

//handler.bypassPrefix = true

handler.pluginName = 'ping 2'
handler.command = ['ping2']
handler.alias = ['p2']
handler.category = [C.TOOL, C.BOT]
handler.help = 'buat test apakah bot respond apa kagak. dan hitung durasi simple sendMessage'

export default handler