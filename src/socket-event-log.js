import { bot } from "../index.js"
const ignoredEvent = [
    'presence.update',
    'message-receipt.update',
]

const log = (sock) => {
    sock.ev.process(async (ev) => {

        if(!bot.eventLog) return
        
        // event ignore
        ignoredEvent.forEach(e => {
            delete ev[e]
        })
        if (Object.keys(ev).length) console.log(structuredClone(ev))
    })
}

export default log