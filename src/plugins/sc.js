import { sendText, tag, Category, textOnlyMessage, downloadBuffer } from '../helper.js'
import fs from 'fs'

/**
 * @param {Object} params
 * @param {import("baileys").WASocket} params.sock   // ← auto-complete muncul di sini
 */

async function handler({ sock, jid, q }) {
    if (!textOnlyMessage) return
    return await sock.sendMessage(jid,
        {
            text: 'jangan lupa ⭐ nya ya (⁠◕⁠ᴗ⁠◕⁠✿⁠)',
            contextInfo: {
                externalAdReply: {
                    thumbnail: await fs.promises.readFile('./src/assets/angelina_thumbnail_480p.webp'),
                    thumbnailUrl: 'https://github.com/WolfyFlutter/angelina-bot',
                    title: 'download sc angelina bot',
                    body: 'simple base bot, ESM, plugin, by wolep.',
                    sourceUrl: 'https://github.com/WolfyFlutter/angelina-bot',
                    renderLargerThumbnail: true,
                    mediaType: 1,
                }
            }
        }, { quoted: q }
    )
}

//handler.bypassPrefix = true

handler.pluginName = 'source code'
handler.command = ['sc']
handler.alias = []
handler.category = [Category.OTHER]
handler.help = 'plugin dedicated buat ngasih tempat download sc'

export default handler


