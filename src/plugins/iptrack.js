import axios from 'axios'
import { sendText, commandOnly, Category } from './../helper.js'

async function handler({ m, text, jid }) {
    if (commandOnly(m, text)) {
        return await sendText(
            jid,
            'Masukkan IP address nya!\ncontoh: iptrack 8.8.8.8',
            m
        )
    }

    try {
        const res = await axios.get(
            'https://api.ootaizumi.web.id/tools/ipTrack',
            {
                params: {
                    ip: text.trim()
                }
            }
        )

        const data = res.data

        if (!data.status || !data.result || data.result.status !== 'success') {
            return await sendText(jid, 'Gagal melacak IP', m)
        }

        const r = data.result

        // 🔥 PAKAI MONOSPACE BIAR RAPI
        const output =
`🌐 *IP TRACK RESULT*
\`\`\`
IP        : ${r.query}
Country   : ${r.country} (${r.countryCode})
Region    : ${r.regionName} (${r.region})
City      : ${r.city}
ZIP       : ${r.zip || '-'}
Timezone  : ${r.timezone}

ISP       : ${r.isp}
Org       : ${r.org || '-'}
AS        : ${r.as}

Location
Latitude  : ${r.lat}
Longitude : ${r.lon}
\`\`\``

        await sendText(jid, output, m)

    } catch (error) {
        await sendText(
            jid,
            `Terjadi kesalahan: ${error.response?.data?.message || error.message}`,
            m
        )
    }
}

handler.pluginName = 'IP Tracker'
handler.command = ['iptrack']
handler.alias = ['ip', 'ipinfo']
handler.category = [Category.TOOL]
handler.help = 'Lacak informasi IP address. Contoh: iptrack 8.8.8.8'

export default handler