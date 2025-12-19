import { sendText, commandOnly, Category } from '../helper.js'
import { sock } from '../../index.js'
async function handler({ m, text, jid }) {

   if (commandOnly(m, text)) {
      return await sendText(
         jid,
         'Contoh:\n!setname Kira Bot',
         m
      )
   }

   const newName = text.trim()

   try {
      await sock.updateProfileName(newName)

      await sendText(
         jid,
         `✅ Nama bot berhasil diubah menjadi:\n*${newName}*`,
         m
      )
   } catch (err) {
      console.error(err)
      await sendText(
         jid,
         'Gagal mengubah nama bot.',
         m
      )
   }
}

handler.pluginName = 'gwnti nama bot nya'
handler.command = ['setname']
handler.alias = []
handler.category = [Category.OWNER]
handler.help = 'Mengubah nama profil bot.\nContoh: !setname Karudo Bot'

export default handler