import FormData from 'form-data';
import fetch from 'node-fetch';
import { sock } from '../../index.js';
import { sendText, commandOnly, getBuff, Category } from './../helper.js';

async function handler({ m, jid }) {
  if (commandOnly(m)) return sendText(jid, 'Reply atau kirim gambar untuk di-upscale.', m);

  try {
    const q = m.q || m;
const mese = q;

const mime = mese?.message?.[mese.type]?.mimetype || '';

if (!mime) {
  return sendText(jid, 'Reply atau kirim gambar.', m);
}

if (!/^image\/(jpe?g|png|webp)$/i.test(mime)) {
  return sendText(jid, 'Format tidak didukung. Kirim JPG / PNG / WEBP.', m);
}


    await sendText(jid, 'wet...', m);

    const buffer = await getBuff(q);
    if (!buffer || buffer.length === 0) return sendText(jid, 'plis not porno.', m);

    const form = new FormData();
    form.append('scale', '2'); // upscale 2x
    form.append('image', buffer, { filename: 'image.png', contentType: mime });

    const res = await fetch('https://api2.pixelcut.app/image/upscale/v1', {
      method: 'POST',
      headers: { 'x-client-version': 'web' },
      body: form
    });

    if (!res.ok) throw new Error(`Upscale failed: ${res.statusText}`);

    const upscaledBuffer = Buffer.from(await res.arrayBuffer());

    await sock.sendMessage(
      jid,
      { image: upscaledBuffer, caption: '✅ Gambar berhasil di-upscale' },
      { quoted: m }
    );

  } catch (err) {
    console.error(err);
    await sendText(jid, `❌ Error: ${err.message}`, m);
  }
}

handler.pluginName = 'hd in image wkwk';
handler.command = ['remini', 'hd'];
handler.alias = [];
handler.category = [Category.TOOL];
handler.help = 'Upscale gambar agar lebih HD (2x).';

export default handler;