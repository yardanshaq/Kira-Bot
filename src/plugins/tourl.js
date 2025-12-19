import axios from 'axios'
import FormData from 'form-data'
import { Category, sendText, commandOnly, getBuff } from './../helper.js'
import { sock } from '../../index.js'

const uploadCatbox = async (buffer, ext) => {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, { filename: `file.${ext}` })

  const res = await axios.post(
    'https://catbox.moe/user/api.php',
    form,
    {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    }
  )

  // catbox return PLAIN TEXT URL
  if (typeof res.data !== 'string' || !res.data.startsWith('https://')) {
    throw new Error('Catbox upload gagal')
  }

  return res.data.trim()
}

async function handler({ m, jid }) {
  if (commandOnly(m)) {
    return await sendText(jid, 'gambar / video / audio nya mana jir?', m)
  }

  try {
    const q = m.q ? m.q : m
    const msg = q.message

    const imgMsg = msg.imageMessage
    const vidMsg = msg.videoMessage
    const mp3Msg = msg.audioMessage

    let mime = ''
    let ext = ''

    if (imgMsg) {
      mime = imgMsg.mimetype
      ext = mime.split('/')[1]
    } else if (vidMsg) {
      mime = vidMsg.mimetype
      ext = mime.split('/')[1]
    } else if (mp3Msg) {
      mime = mp3Msg.mimetype
      ext = 'mp3'
    } else {
      return sendText(jid, 'Media tidak didukung!', m)
    }

    const buffer = await getBuff(q)

    await sendText(jid, 'uploading ke catbox...', m)

    const url = await uploadCatbox(buffer, ext)

    const result =
      `✅ *UPLOAD BERHASIL*\n\n` +
      `Catbox:\n${url}`

    await sendText(jid, result, m)

  } catch (e) {
    console.error(e)
    await sendText(jid, `❌ Error:\n${e.message}`, m)
  }
}

handler.pluginName = 'tourl'
handler.command = ['tourl']
handler.alias = ['imgurl']
handler.category = [Category.TOOL]
handler.help = 'Upload media ke catbox.moe dan dapatkan URL'

export default handler