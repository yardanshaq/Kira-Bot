import { sock } from '../../index.js';
import {
  sendText,
  sendImageSticker,
  sendVideoSticker,
  getBuff,
  Category
} from '../helper.js';

async function handler({ m, jid, text }) {
  const med = m.q ? m.q : m;
  const medImage = med.message?.imageMessage;
  const medVideo = med.message?.videoMessage;

  if (!medImage && !medVideo) {
    return sendText(jid, "Reply/Kirim gambar atau video.", m);
  }

  try {
    const buff = await getBuff(med);
    const [pname, authname] = (text || "").split("|");

    if (medImage) {
      await sendImageSticker(jid, {
        buffer: buff,
        packname: pname || "",
        author: authname || ""
      }, m);
    } else if (medVideo) {
      await sendVideoSticker(jid, {
        buffer: buff,
        packname: pname || "",
        author: authname || ""
      }, m);
    }
  } catch (e) {
    console.log(e);
    sendText(jid, e.message, m);
  }
}

handler.pluginName = 'Image/Video to Sticker';
handler.command = ['sticker'];
handler.alias = ['s'];
handler.category = [Category.GENERATOR];
handler.help = 'Convert Image/Video ke sticker (webp).';

export default handler;