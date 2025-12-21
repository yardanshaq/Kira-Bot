import { sendFancyText, Category, msToReadableTime } from '../helper.js'
import os from 'node:os'
import fs from 'node:fs'

async function handler({ jid }) {

    // ========================
    // BASIC SYSTEM INFO
    // ========================
    const cpus = os.cpus()
    const cpuModel = cpus[0].model
    const cpuCores = cpus.length

    // ========================
    // OS INFO (Ubuntu LTS)
    // ========================
    let osName = `${os.platform()} ${os.release()}`
    try {
        const osRelease = fs.readFileSync('/etc/os-release', 'utf8')
        const match = osRelease.match(/^PRETTY_NAME="(.+)"$/m)
        if (match) osName = match[1]
    } catch {}

    // ========================
    // RAM
    // ========================
    const ramTotal = os.totalmem()
    const ramFree = os.freemem()
    const ramUsed = ramTotal - ramFree
    const ramPercent = ((ramUsed / ramTotal) * 100).toFixed(1)

    // ========================
    // DISK (root)
    // ========================
    const disk = fs.statfsSync('/')
    const diskTotal = disk.blocks * disk.bsize
    const diskFree = disk.bfree * disk.bsize
    const diskUsed = diskTotal - diskFree
    const diskPercent = ((diskUsed / diskTotal) * 100).toFixed(1)

    // ========================
    // FORMATTERS
    // ========================
    const formatStorage = (bytes) => {
        const gb = bytes / 1024 / 1024 / 1024
        if (gb >= 1024) return (gb / 1024).toFixed(2) + ' TB'
        return gb.toFixed(2) + ' GB'
    }

    const uptime = msToReadableTime(os.uptime() * 1000)
    const line = '============================='

    // ========================
    // OUTPUT
    // ========================
    const output =
`🌐 *NODE STATISTICS*
by shaq
\`\`\`
${line}
SERVER NODE
${line}
CPU Model : ${cpuModel}
CPU Cores : ${cpuCores}
OS        : ${osName}
Arch      : ${os.arch()}
Node      : ${process.version}
${line}
RESOURCE STATUS
${line}
RAM Usage : ${formatStorage(ramUsed)} / ${formatStorage(ramTotal)} (${ramPercent}%)
Disk      : ${formatStorage(diskUsed)} / ${formatStorage(diskTotal)} (${diskPercent}%)
Uptime    : ${uptime}
${line}
Status    : ONLINE 🟢
${line}
\`\`\``

    return await sendFancyText(
        jid,
        output,
        'shaq',
        'node statistics',
        null,
        false
    )
}

handler.pluginName = 'spec'
handler.command = ['spec']
handler.alias = []
handler.category = [Category.BOT]
handler.help = 'lihat statistik node / server'

export default handler