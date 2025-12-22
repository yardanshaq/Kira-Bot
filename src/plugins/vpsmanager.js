/**
 * ┌─「 Proxmox VPS Manager 」 
 * │
 * ├ Converted from Tixo Bot
 * └─ Owner only
 */

import fetch from 'node-fetch'
import https from 'https'
import { sendText, Category } from '../helper.js'

const PROXMOX_BASE = 'https://135.220.218.52:8006/api2/json'
const PROXMOX_TOKEN = 'PVEAPIToken=root@pam!Bot1=3059bfba-1462-49ab-93da-f28847b1f15c'
const NODE = 'yardanshaq'

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  checkServerIdentity: () => undefined
})

/* =======================
   PROXMOX CORE
======================= */
async function proxmoxFetch(url, method = 'POST', body = null) {
  const headers = { Authorization: PROXMOX_TOKEN }
  if (body) headers['Content-Type'] = 'application/x-www-form-urlencoded'

  const res = await fetch(url, { method, headers, body, agent: httpsAgent })
  const text = await res.text()
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`)
  return JSON.parse(text).data
}

async function waitTask(upid) {
  while (true) {
    const res = await proxmoxFetch(
      `${PROXMOX_BASE}/nodes/${NODE}/tasks/${encodeURIComponent(upid)}/status`,
      'GET'
    )
    if (res.status === 'stopped') return res.exitstatus === 'OK'
    await new Promise(r => setTimeout(r, 1000))
  }
}

/* ================= ACTION ================= */

async function startVPS(vmid) {
  const upid = await proxmoxFetch(
    `${PROXMOX_BASE}/nodes/${NODE}/lxc/${vmid}/status/start`,
    'POST'
  )
  await waitTask(upid)
}

async function stopVPS(vmid) {
  const upid = await proxmoxFetch(
    `${PROXMOX_BASE}/nodes/${NODE}/lxc/${vmid}/status/stop`,
    'POST'
  )
  await waitTask(upid)
}

async function restartVPS(vmid) {
  const upid = await proxmoxFetch(
    `${PROXMOX_BASE}/nodes/${NODE}/lxc/${vmid}/status/reboot`,
    'POST'
  )
  await waitTask(upid)
}

async function deleteVPS(vmid) {
  const upid = await proxmoxFetch(
    `${PROXMOX_BASE}/nodes/${NODE}/lxc/${vmid}`,
    'DELETE'
  )
  await waitTask(upid)
}

async function statusVPS(vmid) {
  return proxmoxFetch(
    `${PROXMOX_BASE}/nodes/${NODE}/lxc/${vmid}/status/current`,
    'GET'
  )
}

// 🔥 LIST VPS DISINI
async function listVPS() {
  const list = await proxmoxFetch(
    `${PROXMOX_BASE}/nodes/${NODE}/lxc`,
    'GET'
  )
  return list
}

/* =======================
   ANGELINA HANDLER
======================= */
async function handler({ m, text, jid }) {
  const reply = (msg) => sendText(jid, msg, m)
  const args = text?.trim().split(/\s+/) || []

  try {
    const action = (args[0] || '').toLowerCase()
    const vmid = args[1]

    if (!['start', 'stop', 'restart', 'delete', 'status', 'list'].includes(action))
      return reply(
        `⚙️ VPS Manager\n\n` +
        `.vps list\n` +
        `.vps status <vmid>\n` +
        `.vps start <vmid>\n` +
        `.vps stop <vmid>\n` +
        `.vps restart <vmid>\n` +
        `.vps delete <vmid>`
      )

    /* ================= LIST ================= */
    if (action === 'list') {
      reply('📡 Mengambil data VPS...')

      const vps = await listVPS()
      if (!vps.length) return reply('❌ Tidak ada VPS')

      const txt = vps
        .map(v =>
          `VMID: ${v.vmid}\n` +
          `Nama: ${v.name || '-'}\n` +
          `Status: ${v.status}\n` +
          `IP: ${v.ip || 'Unknown'}\n`
        )
        .join('\n──────────────\n')

      return reply(`📋 LIST VPS\n\n${txt}`)
    }

    if (!vmid) return reply('❌ Masukkan VMID!')

    /* ================= START ================= */
    if (action === 'start') {
      reply(`🚀 Starting VPS ${vmid}...`)
      await startVPS(vmid)
      return reply(`✅ VPS ${vmid} berhasil dinyalakan!`)
    }

    /* ================= STOP ================= */
    if (action === 'stop') {
      reply(`🛑 Stopping VPS ${vmid}...`)
      await stopVPS(vmid)
      return reply(`✅ VPS ${vmid} berhasil dimatikan!`)
    }

    /* ================= RESTART ================= */
    if (action === 'restart') {
      reply(`🔁 Restarting VPS ${vmid}...`)
      await restartVPS(vmid)
      return reply(`✅ VPS ${vmid} berhasil direstart!`)
    }

    /* ================= STATUS ================= */
    if (action === 'status') {
      reply(`📡 Mengecek status VPS ${vmid}...`)
      const s = await statusVPS(vmid)

      return reply(
        `📊 STATUS VPS ${vmid}\n\n` +
        `State: ${s.status}\n` +
        `Uptime: ${s.uptime}s\n` +
        `CPU: ${(s.cpu * 100).toFixed(1)}%\n` +
        `RAM Used: ${Math.round(s.mem / 1024 / 1024)} MB`
      )
    }

    /* ================= SAFE DELETE ================= */
    if (action === 'delete') {
      reply(`🗑️ Mengecek status VPS ${vmid}...`)
      const s = await statusVPS(vmid)

      if (s.status === 'running') {
        reply('⚠️ VPS masih running, stop dulu...')
        await stopVPS(vmid)
        reply('🛑 VPS berhasil distop, lanjut hapus...')
      }

      await deleteVPS(vmid)
      return reply(`🗑️ VPS ${vmid} berhasil dihapus!`)
    }

  } catch (err) {
    console.error(err)
    reply(`❌ Error: ${err.message}`)
  }
}

/* =======================
   METADATA
======================= */
handler.pluginName = 'Proxmox VPS Manager'
handler.command = ['vps']
handler.alias = []
handler.category = [Category.OWNER]
handler.help = 'Kelola VPS Proxmox (start/stop/restart/delete/status/list)'
handler.preventDelete = true

export default handler