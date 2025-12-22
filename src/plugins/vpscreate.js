/**
 * ┌─「 Proxmox CVPS 」 
 * │
 * ├ Converted from Tixo Bot
 * └─ Owner only
 */

import fetch from 'node-fetch'
import https from 'https'
import { Client } from 'ssh2'
import { sendText, Category } from '../helper.js'

const PROXMOX_BASE = 'https://135.220.218.52:8006/api2/json'
const PROXMOX_TOKEN = 'PVEAPIToken=root@pam!Bot1=3059bfba-1462-49ab-93da-f28847b1f15c'
const NODE = 'yardanshaq'

const HOST_IP = '135.220.218.52'
const HOST_USER = 'root'
const HOST_PASS = 'yardanshaq'

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

async function waitForTaskDone(upid) {
  while (true) {
    const res = await proxmoxFetch(
      `${PROXMOX_BASE}/nodes/${NODE}/tasks/${encodeURIComponent(upid)}/status`,
      'GET'
    )
    if (res.status === 'stopped') {
      if (res.exitstatus === 'OK') return true
      throw new Error(`Task gagal: ${res.exitstatus}`)
    }
    await new Promise(r => setTimeout(r, 1000))
  }
}

async function waitConfigExists(vmid, timeout = 60000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      await proxmoxFetch(`${PROXMOX_BASE}/nodes/${NODE}/lxc/${vmid}/config`, 'GET')
      return true
    } catch {}
    await new Promise(r => setTimeout(r, 1500))
  }
  return false
}

async function getTaskLog(upid) {
  try {
    const res = await fetch(
      `${PROXMOX_BASE}/nodes/${NODE}/tasks/${encodeURIComponent(upid)}/log`,
      { headers: { Authorization: PROXMOX_TOKEN }, agent: httpsAgent }
    )
    const json = await res.json()
    return json.data?.map(v => v.t).join('\n') || 'No log'
  } catch {
    return 'Log tidak bisa diambil'
  }
}

async function checkVMID(vmid) {
  try {
    await proxmoxFetch(
      `${PROXMOX_BASE}/nodes/${NODE}/lxc/${vmid}/status/current`,
      'GET'
    )
    return true
  } catch (e) {
    const msg = e.message || ''
    if (
      msg.includes('404') ||
      msg.includes('does not exist') ||
      msg.includes('Configuration file') ||
      msg.includes('No such file')
    ) return false
    throw e
  }
}

async function getNextVMID() {
  let vmid = 115
  while (await checkVMID(vmid)) vmid++
  return vmid
}

async function startCT(vmid) {
  return proxmoxFetch(`${PROXMOX_BASE}/nodes/${NODE}/lxc/${vmid}/status/start`, 'POST')
}

async function waitForCTReady(vmid, timeout = 30000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      await proxmoxFetch(`${PROXMOX_BASE}/nodes/${NODE}/lxc/${vmid}/status/current`, 'GET')
      return true
    } catch {}
    await new Promise(r => setTimeout(r, 1000))
  }
  throw new Error('Timeout waiting CT ready')
}

/* =======================
   GET TEMPLATE API
======================= */
async function getTemplates() {
  const data = await proxmoxFetch(
    `${PROXMOX_BASE}/nodes/${NODE}/storage/local/content?content=vztmpl`,
    'GET'
  )
  return data.map(v => v.volid)
}

/* =======================
 SSH HOST
======================= */
async function sshExecHost(command) {
  return new Promise((resolve, reject) => {
    const c = new Client()

    c.on('ready', () => {
      c.exec(command, (err, stream) => {
        if (err) return reject(err)
        let out = ''
        stream.on('data', d => out += d.toString())
        stream.stderr?.on('data', d => out += d.toString())
        stream.on('close', () => {
          c.end()
          resolve(out.trim())
        })
      })
    })

    c.on('error', reject)

    c.connect({
      host: HOST_IP,
      port: 22,
      username: HOST_USER,
      password: HOST_PASS,
      readyTimeout: 20000
    })
  })
}

async function waitHostSSH(timeout = 60000) {
  const s = Date.now()
  while (Date.now() - s < timeout) {
    try {
      await sshExecHost('echo ok')
      return true
    } catch {}
    await new Promise(r => setTimeout(r, 1500))
  }
  throw new Error('SSH Host tidak bisa diakses!')
}

/* =======================
 CREATE CT
======================= */
async function createCT(opts) {
  const { vmid, hostname, ostemplate, ip, password, ram, cpu, disk } = opts

  const params = new URLSearchParams({
    vmid,
    hostname,
    ostemplate,
    storage: 'local',
    memory: ram,
    cores: cpu,
    onboot: '1',
    password,
    unprivileged: '1',
    features: 'nesting=1',
    net0: `name=eth0,bridge=vmbr1,ip=${ip}/24,gw=192.168.11.1`,
    nameserver: '8.8.8.8',
    rootfs: `local:${disk}`,
    swap: '512'
  })

  const upid = await proxmoxFetch(
    `${PROXMOX_BASE}/nodes/${NODE}/lxc`,
    'POST',
    params.toString()
  )

  await waitForTaskDone(upid)

  const ok = await waitConfigExists(vmid)
  if (!ok) {
    const log = await getTaskLog(upid)
    throw new Error(`CT gagal dibuat!\n\n${log}`)
  }

  await new Promise(r => setTimeout(r, 4000))
  return true
}

/* =======================
 ANGELINA HANDLER
======================= */
async function handler({ m, text, jid }) {
  const reply = (msg) => sendText(jid, msg, m)
  const args = text?.trim().split(/\s+/) || []

  try {

    if (args[0] === 'os') {
      const list = await getTemplates()
      const txt = list
        .map((v, i) => `${i + 1}. ${v.replace('local:vztmpl/', '')}`)
        .join('\n')

      return reply(
        `📦 Daftar OS di Proxmox:\n\n${txt}\n\n` +
        `Gunakan nomor, contoh:\n.cvps nama 3 password`
      )
    }

    const [
      hostname,
      osIndex,
      password,
      ram = '1024',
      cpu = '2',
      disk = '8'
    ] = args

    if (!hostname || !osIndex || !password) {
      return reply(
        "Format:\n.cvps <hostname> <no_os> <password> <ram> <cpu> <disk>\n\n(ram satuan MB) (disk satuan GB)\n" +
"contoh command:\n" +
"cvps wolep 4 wolep123 4096 2 30\n\n" +
        "Cek OS: .cvps os"
      )
    }

    reply('📦 Mengambil OS...')
    const templates = await getTemplates()

    const index = parseInt(osIndex) - 1
    if (isNaN(index) || !templates[index])
      return reply('❌ OS tidak ditemukan.')

    const ostemplate = templates[index]
    reply(`🖥️ OS: ${ostemplate}`)

    const vmid = await getNextVMID()
    reply(`📎 VMID: ${vmid}`)

    const ip = `192.168.11.${vmid - 80}`
    reply(`🌐 IP: ${ip}`)

    reply('🚀 Membuat VPS...')
    await createCT({ vmid, hostname, ostemplate, ip, password, ram, cpu, disk })

    reply('📝 Start VPS...')
    await startCT(vmid)

    reply('⏳ Booting...')
    await waitForCTReady(vmid)

    reply('⏳ Menunggu SSH Host...')
    await waitHostSSH()

    reply('🔐 Setup SSH di CT...')
    await sshExecHost(
      `pct exec ${vmid} -- bash -c "wget -qO- https://raw.githubusercontent.com/Nauvalunesa/Setupbot/main/sshsetup.sh | bash"`
    )

    reply('🌐 Setup Port di Host...')
    const portResult = await sshExecHost(
      `wget -qO- https://raw.githubusercontent.com/Nauvalunesa/Setupbot/main/Port.sh | bash -s ${ip}`
    )

    let publicIp =
      (portResult.match(/IP Publik:\s*([\d.]+)/)?.[1]) ||
      (portResult.match(/(\d+\.\d+\.\d+\.\d+):\d+\s+→/)?.[1]) ||
      HOST_IP

    let sshPortMatch = portResult.match(
      new RegExp(`${publicIp}:(\\d+)\\s+→\\s+${ip}:22`)
    )
    let sshPort = sshPortMatch ? sshPortMatch[1] : '22'

    reply(
      `✅ VPS SIAP!\n\n` +
      `VMID: ${vmid}\nHostname: ${hostname}\n` +
      `OS: ${ostemplate.replace('local:vztmpl/', '')}\n\n` +
      `🔐 LOGIN INFO\nIP Public: ${publicIp}\nSSH Port: ${sshPort}\n` +
      `User: root\nPassword: ${password}\n\n` +
      `🌐 Private IP: ${ip}\nRAM: ${ram} MB\nCPU: ${cpu} Core\nDisk: ${disk} GB`
    )

  } catch (e) {
    console.error(e)
    reply(`❌ Error: ${e.message}`)
  }
}

handler.pluginName = 'Create VPS Proxmox'
handler.command = ['cvps']
handler.alias = []
handler.category = [Category.OWNER]
handler.help = 'Buat VPS Proxmox (owner only)'
handler.preventDelete = true

export default handler