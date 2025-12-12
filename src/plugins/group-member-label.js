
import { sendText, commandOnly, Category, setBotLabel, textOnlyMessage } from './../helper.js'

/**
 * @param {Object} params
 * @param {import("baileys").WASocket} params.sock   // ← auto-complete muncul di sini
 */


async function handler({ sock, m, text, jid, prefix, command }) {
   if (!textOnlyMessage(m)) return
   await setBotLabel(jid, text)
   await sendText(jid, 'sukses! check my new label boss')
   return
}

//handler.bypassPrefix = true

handler.pluginName = 'working'
handler.command = ['label']
handler.alias = []
handler.category = [Category.TOOL, Category.BOT]
handler.help = 'buat test apakah bot respond apa kagak.'

export default handler