import axios from 'axios'
import { sendText, commandOnly, Category } from './../helper.js'

async function handler({ m, text, jid }) {
    if (commandOnly(m, text)) {
        return await sendText(
            jid,
            'Masukkan nama lokasi!\ncontoh: cuaca jombang',
            m
        )
    }

    try {
        const res = await axios.get(
            'https://api.ootaizumi.web.id/lokasi/cuaca',
            {
                params: {
                    lokasi: text.trim()
                }
            }
        )

        const data = res.data

        if (!data.status || !data.result) {
            return await sendText(jid, 'Data cuaca tidak ditemukan', m)
        }

        const r = data.result
        const c = r.cuaca
        const l = r.lokasi
        const k = r.koordinat
        const a = c.angin

        const output =
`🌦️ *INFO CUACA*
\`\`\`
Lokasi     : ${r.namaTempat}
Provinsi   : ${l.provinsi}
Kota/Kab   : ${l.kotkab}
Kecamatan  : ${l.kecamatan}
Desa       : ${l.desa}

Waktu      : ${c.waktu}
Cuaca      : ${c.deskripsi}
Suhu       : ${c.suhu}
Kelembapan : ${c.kelembapan}
Awan       : ${c.tutupanAwan}
Jarak Pand : ${c.jarakPandang.teks}

Angin
Dari       : ${a.dari}
Ke         : ${a.ke}
Kecepatan  : ${a.kecepatan}
Derajat    : ${a.derajat}°

Koordinat
Latitude  : ${k.latitude}
Longitude : ${k.longitude}
\`\`\`

🔗 BMKG : ${r.url.bmkg}
🗺️ Maps : ${r.url.gmaps}`

        await sendText(jid, output, m)

    } catch (error) {
        await sendText(
            jid,
            `Terjadi kesalahan: ${error.response?.data?.message || error.message}`,
            m
        )
    }
}

handler.pluginName = 'Cuaca'
handler.command = ['cuaca', 'weather']
handler.alias = ['weather', 'wthr']
handler.category = [Category.TOOL]
handler.help = 'Cek informasi cuaca berdasarkan lokasi. Contoh: cuaca jombang'

export default handler