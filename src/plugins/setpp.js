import { sendText, Category, getBuff } from './../helper.js'
import { sock, user } from '../../index.js'
async function handler({ m, q, jid }) {
if (!
user.trustedJids.has(m.senderId))
return await sendText(jid, 'khusus owner')

   const img = m.q ? m.q : m

   if (!img) {
      return await sendText(
         jid,
         'Kirim atau reply gambar dengan caption:\nsetpp',
         m
      )
   }

   try {
      
      const buffer = await getBuff(img)

    
      await sock.updateProfilePicture(sock.user.id, buffer)

      await sendText(jid, '✅ Foto profil bot berhasil diubah.', m)
   } catch (err) {
      console.error(err)
      await sendText(jid, ' Gagal mengubah foto profil bot.', m)
   }
}

handler.pluginName = 'ganti pp bot'
handler.command = ['setpp']
handler.alias = ['setppbot', 'setprofile']
handler.category = [Category.BOT]
handler.help = 'Ubah foto profil bot dengan kirim atau reply gambar.'

export default handler