/**
 * 📌 Name: RemoveBG
 * 🏷️ Type: Plugin ESM
 * 👤 Creator: Kadz
 */

import FormData from 'form-data';
import axios from 'axios';
import { sock } from '../../index.js';
import { sendText, commandOnly, getBuff, Category } from './../helper.js';

async function removeBg(buffer) {
  try {
    const form = new FormData();
    form.append('file', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' });

    const { data } = await axios.post(
      'https://removebg.one/api/predict/v2',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'user-agent': 'Mozilla/5.0 (Linux; Android 10)',
          accept: 'application/json, text/plain, */*',
          'sec-ch-ua': '"Chromium";v="139", "Not;A=Brand";v="99"',
          platform: 'PC',
          'sec-ch-ua-platform': '"Android"',
          origin: 'https://removebg.one',
          referer: 'https://removebg.one/upload'
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    );

    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function handler({ m, jid }) {
  if (commandOnly(m)) return sendText(jid, 'Kirim gambar dengan caption removebg untuk dihapus background-nya.', m);

  try {
    const q = m.quoted ? m.quoted : m;
    const mime = q.message?.imageMessage?.mimetype || '';

    if (!mime.startsWith('image/')) return sendText(jid, 'mana gambar nya', m);

    await sendText(jid, 'wet....', m);

    const buffer = await getBuff(q);
    if (!buffer || buffer.length === 0) return sendText(jid, '❌ Gagal membaca gambar.', m);

    const result = await removeBg(buffer);

    if (!result || !result.data || !result.data[0]?.url) return sendText(jid, '❌ Gagal menghapus background.', m);

    const bgRemovedUrl = result.data[0].url;

    await sock.sendMessage(
      jid,
      { image: { url: bgRemovedUrl }, caption: '✅ Background berhasil dihapus' },
      { quoted: m }
    );

  } catch (err) {
    console.error(err);
    await sendText(jid, `❌ Error: ${err.message}`, m);
  }
}

handler.pluginName = 'kirim gambar dengan caption removebg ga support reply ygy';
handler.command = ['removebg', 'rbg'];
handler.alias = [];
handler.category = [Category.TOOL];
handler.help = 'Hapus background gambar.';

export default handler;