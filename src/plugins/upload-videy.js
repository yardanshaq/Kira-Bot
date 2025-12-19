/**
 * 📌 Name: upVidey
 * 🏷️ Type: Plugin ESM
 * 👤 Creator: Kadz
 */

import { sock } from '../../index.js';
import axios from 'axios';
import FormData from 'form-data';
import crypto from 'crypto';
import { sendText, commandOnly, getBuff, Category } from './../helper.js';

async function handler({ m, jid }) {
  if (commandOnly(m)) return sendText(jid, 'Reply video atau kirim video untuk di-upload.', m);

  try {
    // pakai m sendiri untuk kirim, atau m.quoted untuk reply
    const q = m.quoted ? m.quoted : m;

    // ambil buffer pakai helper getBuff
    const buffer = await getBuff(q);

    if (!buffer || buffer.length === 0) {
      return sendText(jid, '❌ Gagal membaca file. Pastikan file video valid.', m);
    }

    await sendText(jid, '⏳ Uploading ke Videy...', m);

    const form = new FormData();
    form.append('file', buffer, { filename: 'video.mp4', contentType: 'video/mp4' });

    const res = await axios.post(
      'https://videy.co/api/upload?visitorId=' + crypto.randomUUID(),
      form,
      {
        headers: { ...form.getHeaders() },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    );

    const link = res.data?.link || res.data?.output?.link;
    if (!link) return sendText(jid, '❌ Upload gagal.', m);

    await sendText(jid, `✅ Upload berhasil!\n\n🔗 ${link}`, m);

  } catch (err) {
    console.error(err);
    await sendText(jid, `❌ Error:\n${err.message}`, m);
  }
}

handler.pluginName = 'upVidey';
handler.command = ['upvidey', 'videy'];
handler.alias = [];
handler.category = [Category.TOOL];
handler.help = 'Upload video ke Videy.co dan dapatkan link';

export default handler;