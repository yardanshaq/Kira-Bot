import fetch from 'node-fetch'
import { sendText, commandOnly, Category } from './../helper.js'
import { sock } from '../../index.js'

const pinterestBookmarks = new Map();

async function handler({ m, text, jid }) {
    if (commandOnly(m, text)) return await sendText(jid, `Masukkan kata kunci pencarian Pinterest!`, m)
    
    const [jumlah, ...rawquery] = text.split(" ");
    const query = rawquery.join(" ");
    
    try {
        const queryKey = query.toLowerCase();
        const bookmark = pinterestBookmarks.get(queryKey) || null;

        const cookie = '_pinterest_sess=YOUR_COOKIE; csrftoken=YOUR_CSRFTOKEN';
        const csrftoken = 'YOUR_CSRFTOKEN';
        const url = 'https://id.pinterest.com/resource/BaseSearchResource/get/';

        const headers = {
            'accept': 'application/json, text/javascript, */*, q=0.01',
            'accept-language': 'id-ID',
            'content-type': 'application/x-www-form-urlencoded',
            'cookie': cookie,
            'origin': 'https://id.pinterest.com',
            'referer': `https://id.pinterest.com/search/pins/?q=${encodeURIComponent(query)}&rs=typed`,
            'user-agent': 'Mozilla/5.0',
            'x-csrftoken': csrftoken,
            'x-pinterest-appstate': 'active',
            'x-pinterest-source-url': `/search/pins/?q=${encodeURIComponent(query)}&rs=typed`,
            'x-requested-with': 'XMLHttpRequest'
        };

        const body = new URLSearchParams();
        body.append('source_url', `/search/pins/?q=${encodeURIComponent(query)}&rs=typed`);
        body.append('data', JSON.stringify({
            options: {
                query: query,
                scope: 'pins',
                rs: 'typed',
                redux_normalize_feed: true,
                bookmarks: bookmark
            },
            context: {}
        }));

        const res = await fetch(url, { method: 'POST', headers, body });
        const json = await res.json();

        const results = json?.resource_response?.data?.results || [];
        const newBookmark = json?.resource_response?.bookmark;

        if (newBookmark) pinterestBookmarks.set(queryKey, [newBookmark]);
        else pinterestBookmarks.delete(queryKey);

        if (!results.length) return await sendText(jid, `🍂 *Tidak ada hasil.*`, m);

        const images = results
            .map(v => ({
                title: v.grid_title ? v.grid_title : "-",
                url: v.images?.['736x']?.url || v.images?.['474x']?.url,
                author: {
                  id: v.pinner?.id || "Unknown-",
                  username: v.pinner?.username || "Unknown-",
                  display: v.pinner?.full_name || "Unknown-"
                }
            }))
            .filter(v => v.url)
            .slice(0, jumlah);

        if (jumlah > results.length) return sendText(jid, "Jumlah terlalu banyak!", m);
        for (const img of images) {
            await sock.sendMessage(jid, {
                image: { url: img.url },
                caption: `*${img.title}*\n\n - *Author:* ${img.author.display}`
            });
            await new Promise(r => setTimeout(r, 800)); // delay biar gak spam
        }

    } catch (e) {
        await sendText(jid, `🍂 Terjadi kesalahan.`, m)
    }
}

handler.pluginName = 'Pinterest Downloader Fix'
handler.command = ['pinterest','pin']
handler.alias = []
handler.category = [Category.SEARCH]
handler.help = 'Search gambar Pinterest, contoh: pin <keyword>'

export default handler;