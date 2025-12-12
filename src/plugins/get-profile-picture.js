
import { sendText, commandOnly, Category, textOnlyMessage, tag } from '../helper.js'

/**
 * @param {Object} params
 * @param {import("baileys").WASocket} params.sock 
 * @param {import ("baileys").WAMessage} params.m
 */


async function handler({ sock, m, text, jid, prefix, command }) {

   const safeExecute = async (fn, ...params) => {
      try {
         return await fn(...params)
      } catch (e) {
         return e.message
      }
   }

   if (!textOnlyMessage) return
   const mentionedMembers = m.message.extendedTextMessage?.contextInfo?.mentionedJid || []
   console.log(mentionedMembers)
   if (!mentionedMembers.length) return sendText(jid, 'tag salah satu atau beberapa orang', m)
   let print = []
   
   for(let i=0; i<mentionedMembers.length; i++){
      print.push(`${tag(mentionedMembers[i])} ${await safeExecute(sock.profilePictureUrl, mentionedMembers[i], 'image', 3000)}`)
   }
   return await sendText(jid, print.join('\n\n'))


}

handler.bypassPrefix = false
handler.pluginName = 'get profile picture'
handler.command = ['getpp']
handler.alias = []
handler.category = [Category.TOOL, Category.BOT]
handler.help = 'buat test apakah bot respond apa kagak.'

export default handler