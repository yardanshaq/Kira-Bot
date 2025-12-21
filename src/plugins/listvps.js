/**
 * ┌─「 Proxmox CT List 」
 * │
 * ├ Adapted for Angelina Bot
 * └─ Owner only
 */

import fetch from 'node-fetch'
import https from 'https'
import { sendText, Category } from '../helper.js'

// =======================
// KONFIGURASI PROXMOX
// =======================
const PROXMOX_BASE = 'https://135.220.218.52:8006/api2/json'
const PROXMOX_TOKEN = 'root@pam!Bot1=3059bfba-1462-49ab-93da-f28847b1f15c'
const NODE = 'yardanshaq'

// =======================
// HTTPS AGENT (SELF-SIGNED)
// =======================
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  checkServerIdentity: () => undefined
})

// =======================
// HELPER REQUEST
// =======================
async function proxmoxRequest(path) {
  const res = await fetch(PROXMOX_BASE + path, {
    method: 'GET',
    headers: { Authorization: `PVEAPIToken=${PROXMOX_TOKEN}` },
    agent: httpsAgent
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  const json = await res.json()
  return json.data
}

// =======================
// BOT HANDLER
// =======================
async function handler({ m, jid }) {
  const reply = (msg) => sendText(jid, msg, m)

  try {
    const containers = await proxmoxRequest(`/nodes/${NODE}/lxc`)

    if (!containers || containers.length === 0) {
      return reply(`❌ Tidak ada CT di node "${NODE}".`)
    }

    let msg = `📦 *DAFTAR CT – NODE ${NODE}*\n\n`

    for (const c of containers) {
      const cpuPercent = c.cpu ? (c.cpu * 100).toFixed(1) : '0'
      const memUsedMB = (c.mem / 1024 / 1024).toFixed(1)
      const memMaxMB = (c.maxmem / 1024 / 1024).toFixed(1)
      const diskUsedGB = (c.disk / 1024 / 1024 / 1024).toFixed(1)
      const diskMaxGB = (c.maxdisk / 1024 / 1024 / 1024).toFixed(1)
      const uptime = c.uptime ? `${(c.uptime / 3600).toFixed(1)} jam` : '-'
      const os = c.ostype || c.template || '-'

      msg +=
        `━━━━━━━━━━━━━━━\n` +
        `VMID   : ${c.vmid}\n` +
        `Nama   : ${c.name || '-'}\n` +
        `Status : ${c.status}\n` +
        `OS     : ${os}\n` +
        `CPU    : ${cpuPercent}% (${c.cpus} core)\n` +
        `RAM    : ${memUsedMB} MB / ${memMaxMB} MB\n` +
        `Disk   : ${diskUsedGB} GB / ${diskMaxGB} GB\n` +
        `Uptime : ${uptime}\n`
    }

    return reply(msg)

  } catch (e) {
    console.error('CT LIST ERROR:', e)
    return reply(`❌ Error: ${e.message}`)
  }
}

// =======================
// METADATA
// =======================
handler.pluginName = 'Proxmox CT List'
handler.command = ['listvps', 'ctlist']
handler.alias = []
handler.category = [Category.OWNER]
handler.help = 'Menampilkan daftar container (CT) Proxmox'
handler.preventDelete = true

export default handler