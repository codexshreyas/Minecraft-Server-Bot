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

function getCleanMotd(motd) {
  if (!motd) return null;
  if (Array.isArray(motd.clean)) return motd.clean.filter(Boolean).join('\n');
  if (typeof motd.clean === 'string') return motd.clean;
  return null;
}

function getRawMotd(motd) {
  if (!motd) return null;
  if (Array.isArray(motd.raw)) return motd.raw.filter(Boolean).join('\n');
  if (typeof motd.raw === 'string') return motd.raw;
  return null;
}

module.exports = {
  name: 'motd',
  aliases: ['serverdesc', 'description'],
  description: 'Show the live server MOTD',
  async execute(message) {
    const loading = await message.reply({ embeds: [embed.info('🔎 Fetching server MOTD…')] });

    const javaAddr = config.server.javaIp;
    const data = await fetchJson(`https://api.mcsrvstat.us/3/${javaAddr}`);

    if (!data) {
      return loading.edit({ embeds: [embed.error('Status API Unreachable', 'Could not reach the Minecraft status API.')] });
    }
    if (!data.online) {
      return loading.edit({ embeds: [embed.warn('Server Offline', `**${config.server.name}** is currently offline.`)] });
    }

    const clean = getCleanMotd(data.motd);
    const raw = getRawMotd(data.motd);

    if (!clean && !raw) {
      return loading.edit({ embeds: [embed.warn('No MOTD', 'This server has no MOTD configured.')] });
    }

    const e = embed.info(`📜 ${config.server.name} — MOTD`);
    if (clean) e.addFields({ name: 'Plain Text', value: `\`\`\`\n${clean}\n\`\`\``, inline: false });
    if (raw && raw !== clean) e.addFields({ name: 'With Color Codes', value: `\`\`\`\n${raw}\n\`\`\``, inline: false });

    await loading.edit({ embeds: [e] });
  },
};
