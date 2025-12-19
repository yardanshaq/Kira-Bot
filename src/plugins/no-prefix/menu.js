import { categoryForMenu, category, menuTextAll, categorySubMenuText } from '../../plugin-handler.js'
import { sendText, tag, textOnlyMessage, sendFancyText, msToReadableTime, pickRandom } from '../../helper.js'
import { prefixManager } from '../../../index.js'

const getUptime = function () {
    return new Promise((resolve, reject) => {
        process.send({ cmd: "runtime" })
        process.once("message", async (msg) => {
            if (msg.cmd === "runtime") {
                resolve(msg.data)
            }
        })
    })
}


async function handler({ sock, m, text, q, jid, prefix, command }) {

    const imgUrl = 'https://files.catbox.moe/jeyyw1.jpeg'
    if (!textOnlyMessage(m)) return
    if (q) return

    if (!text) {
        const p = prefixManager.getInfo().isEnable ? prefixManager.getInfo().prefixList[0] : ''
        const headers = `halo kak ${tag(m.senderId)}\nberikut daftar menu yang tersedia:\n\n`
        const footer = `gunakan perintah *${p}${command} ${category.keys().next().value}* untuk membuka sub menu`
        const uptime = msToReadableTime(Math.floor(process.uptime()) * 1000)
        return await sendFancyText(jid, headers + categoryForMenu + '\n\n' + footer, "Kira", "runtime " + uptime + "", imgUrl, true)
    } else {
        if (text.trim() === 'all') {
            return await sendFancyText(jid, menuTextAll, 'menu all', 'Kira', null, false)
        }
        const commandList = category.get(text)
        if (!commandList) return await sendText(jid, `*${text}*invalid category`, m)
        if (!commandList.length) return await sendFancyText(jid, 'aduh menu nya kosong bro..', 'menu ' + text, 'Kira', null, false)
        const print = categorySubMenuText.get(text)
        const footer = '\n\ngunakan perintah *-h* jika kamu ingin tau fungsi command. contoh *' + (commandList[0].split(/ +/g)?.[0].replace(/,$/g, '') + ' -h*' || '(eh plugin nya kosong jir)')
        return await sendFancyText(jid, print + footer, 'menu ' + text, 'Kira', null, false)
    }

}

handler.preventDelete = true
handler.bypassPrefix = true
handler.pluginName = 'menu'
handler.command = ['menu']
handler.alias = []
handler.category = []
handler.help = 'tampilkan menu'

export default handler


