import { sendText, tag, Category, pickWords, } from '../helper.js'

/**
 * @param {Object} params
 * @param {import("baileys").WASocket} params.sock
 */

async function handler({ sock, jid, text, m, q, prefix, command }) {
    if (!text) return await sendText(jid, `please read doc. use *${prefix}${command} -h*`)
    const param = pickWords(text)
    const act = ['get', 'install', 'uninstall']
    if (!act.includes(param[0])) return await sendText(jid, `*${param[0]}* is invalid. please pick one of these ${act.join(', ')}`)

    // get
    if (param[0] === act[0]){
        await sendText(jid, `kamu memilih ${act[0]}`, m)
        return
    }

    // install
    else if (param[0] === act[1]){
        await sendText(jid, `kamu memilih ${act[1]}`, m)
        return
    }

    // uninstall
    else if(param[0] === act[2]){
        await sendText(jid, `kamu memilih ${act[2]}`, m)
        return
    } 

}

handler.bypassPrefix = true
handler.pluginName = 'plugin manager'
handler.command = ['plugin']
handler.alias = []
handler.category = [Category.OWNER]
handler.help = 'plugin manager'

export default handler


