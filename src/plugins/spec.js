import { } from '../../index.js'
import { sendText, tag, Category, sendFancyText, msToReadableTime } from '../helper.js'
import os from 'node:os'



async function handler({sock, m,  text, jid, prefix, command }) {
    const bullet = global.bullet || '↗️'
    const cpus = os.cpus()
    const arch = bullet + 'arch ' + os.arch()
    const cpu_cores = bullet + 'core ' + cpus.length + ' core'
    const cpu_name = bullet + 'cpu ' + cpus[0].model
    const os_version = bullet + 'os ' + os.version()

    const toGB = (byte) => (byte/1073741824).toFixed(2) + ' GB'
    const ramTotal = os.totalmem()
    const ramFree = os.freemem()
    const ramUsage = ramTotal - ramFree

    const ram = `${bullet}RAM ${toGB(ramTotal)}`
    const node_version = bullet + 'node ' + process.version

    const ram_usage = `${bullet}ram usage ${(ramUsage/ramTotal*100).toFixed(0)}% used. ${toGB(ramFree)} free.`
    const nodeRuntime = bullet + 'bot runtime ' + msToReadableTime(parseInt(process.uptime())*1000)
    const hostRuntime = bullet + 'host runtime ' + msToReadableTime(parseInt(os.uptime())*1000)

    const hardware = cpu_name + '\n' + cpu_cores + '\n' + ram
    const software = os_version + '\n' + arch + '\n' + node_version
    const system = hostRuntime + '\n' + ram_usage + '\n\n' + nodeRuntime

    const print = '*hardware*\n' + hardware + '\n\n*software*\n' + software + '\n\n*system*\n' + system
    return await sendFancyText(jid, print, 'angelina bot', 'spesifikasi hardware dan software',null,false) 

    

    
}

//handler.bypassPrefix = true

handler.pluginName = 'spec'
handler.command = ['spec']
handler.alias = []
handler.category = [Category.BOT]
handler.help = 'liat spesifikasi hardware dan software'

export default handler


