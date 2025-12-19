import axios from 'axios'
import { sendText, commandOnly, Category } from './../helper.js'
import { sock } from '../../index.js'

async function handler({ m, text, jid }) {
    if (commandOnly(m, text)) {
        return await sendText(
            jid,
            'Masukkan nama HP!\ncontoh: gsmarena iphone 17 pro max',
            m
        )
    }

    try {
        const res = await axios.get(
            'https://kyyokatsurestapi.my.id/tools/gsmarena',
            {
                params: {
                    query: text.trim()
                }
            }
        )

        const data = res.data

        if (!data.status || !data.result) {
            return await sendText(jid, 'Data HP tidak ditemukan', m)
        }

        const r = data.result
        const s = r.specs

        // ringkas spek utama (WA-friendly)
        const output =
`📱 *GSMARENA*
\`\`\`
Nama       : ${r.phoneName}

NETWORK
Tech       : ${s.Network?.Technology}

LAUNCH
Announced  : ${s.Launch?.Announced}
Status     : ${s.Launch?.Status}

DISPLAY
Type       : ${s.Display?.Type}
Size       : ${s.Display?.Size}
Resolution : ${s.Display?.Resolution}

PLATFORM
OS         : ${s.Platform?.OS}
Chipset    : ${s.Platform?.Chipset}
CPU        : ${s.Platform?.CPU}
GPU        : ${s.Platform?.GPU}

MEMORY
Internal   : ${s.Memory?.Internal}

CAMERA
Main       : ${s['Main Camera']?.Triple?.split('\n')[0]}
Selfie     : ${s['Selfie camera']?.Single?.split('\n')[0]}

BATTERY
Type       : ${s.Battery?.Type}
Charging   : ${s.Battery?.Charging}

PRICE
Price      : ${r.prices?.EUR || 'N/A'}
\`\`\``

        // kirim teks
        await sendText(jid, output, m)

        // kirim gambar HP
        if (r.imageUrl) {
            await sock.sendMessage(
                jid,
                {
                    image: { url: r.imageUrl },
                    caption: r.phoneName
                },
                { quoted: m }
            )
        }

    } catch (error) {
        await sendText(
            jid,
            `Terjadi kesalahan: ${error.response?.data?.message || error.message}`,
            m
        )
    }
}

handler.pluginName = 'GSMArena'
handler.command = ['gsmarena']
handler.alias = ['gsm', 'hp']
handler.category = [Category.TOOL]
handler.help = 'Cari spesifikasi HP dari GSMArena. Contoh: gsmarena iphone 17 pro max'

export default handler