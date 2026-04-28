const embed = require('../../utils/embed');
const config = require('../../config.json');

async function fetchJson(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'PirateHelperBot/1.0' } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

module.exports = {
  name: 'players',
  aliases: ['playerlist', 'online-players', 'who'],
  description: 'List players currently online on the server',
  async execute(message) {
    const loading = await message.reply({ embeds: [embed.info('🔎 Fetching online players…')] });

    const javaAddr = config.server.javaIp;
    const data = await fetchJson(`https://api.mcsrvstat.us/3/${javaAddr}`);

    if (!data) {
      return loading.edit({ embeds: [embed.error('Status API Unreachable', 'Could not reach the Minecraft status API. Try again in a moment.')] });
    }

    if (!data.online) {
      return loading.edit({ embeds: [embed.warn('Server Offline', `**${config.server.name}** is currently offline.`)] });
    }

    const onlineCount = data.players?.online ?? 0;
    const maxCount = data.players?.max ?? 0;
    const list = Array.isArray(data.players?.list) ? data.players.list : [];

    const e = embed.info(`👥 Online Players — ${onlineCount}/${maxCount}`);

    if (onlineCount === 0) {
      e.setDescription('_The server is empty right now. Be the first to join!_');
    } else if (list.length === 0) {
      e.setDescription(
        `**${onlineCount}** player(s) online, but the server doesn\'t expose a player list.\n\n` +
        `_To enable this, set \`enable-query=true\` in \`server.properties\` and restart the server._`
      );
    } else {
      const names = list
        .map((p) => (typeof p === 'string' ? p : p.name))
        .filter(Boolean);

      // Chunk so we don't blow Discord's 1024-char field limit
      const chunks = [];
      let current = '';
      for (const n of names) {
        const line = `• \`${n}\`\n`;
        if ((current + line).length > 1000) {
          chunks.push(current);
          current = '';
        }
        current += line;
      }
      if (current) chunks.push(current);

      chunks.slice(0, 5).forEach((c, i) =>
        e.addFields({ name: i === 0 ? 'Players' : '\u200B', value: c, inline: false })
      );

      // Show first player's avatar as thumbnail
      if (names[0]) e.setThumbnail(`https://mc-heads.net/avatar/${encodeURIComponent(names[0])}/128`);
    }

    await loading.edit({ embeds: [e] });
  },
};
