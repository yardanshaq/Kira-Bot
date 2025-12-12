
import { sendText, commandOnly, Category } from './../helper.js'

/**
 * @param {Object} params
 * @param {import("baileys").WASocket} params.sock   // ← auto-complete muncul di sini
 */


async function handler({ sock, m, text, jid, prefix, command }) {
   
   if (commandOnly(m, text)) return await sendText(jid, 'pong', m)
}

//handler.bypassPrefix = true

handler.pluginName = 'ping'
handler.command = ['ping']
handler.alias = ['p']
handler.category = [Category.TOOL, Category.BOT]
handler.help = 'buat test apakah bot respond apa kagak.'

export default handler