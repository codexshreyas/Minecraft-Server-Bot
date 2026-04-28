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

function fmtMotd(motd) {
  if (!motd) return null;
  if (Array.isArray(motd.clean)) return motd.clean.filter(Boolean).join('\n');
  if (typeof motd.clean === 'string') return motd.clean;
  return null;
}

module.exports = {
  name: 'status',
  aliases: ['serverstatus', 'mcstatus'],
  description: 'Check live server status (Java + Bedrock)',
  async execute(message) {
    const loading = await message.reply({ embeds: [embed.info('🔎 Checking server status…')] });

    const javaAddr = config.server.javaIp;          // e.g. host:port
    const bedrockHost = config.server.bedrockIp;
    const bedrockPort = config.server.bedrockPort || 19132;

    const javaUrl = `https://api.mcsrvstat.us/3/${javaAddr}`;
    const bedrockUrl = `https://api.mcsrvstat.us/bedrock/3/${bedrockHost}:${bedrockPort}`;

    const [java, bedrock] = await Promise.all([fetchJson(javaUrl), fetchJson(bedrockUrl)]);

    const e = embed.info(`📡 ${config.server.name} — Live Status`);

    // Java
    if (java) {
      const motd = fmtMotd(java.motd);
      const lines = [];
      lines.push(`**Status:** ${java.online ? '🟢 Online' : '🔴 Offline'}`);
      if (java.online) {
        lines.push(`**Address:** \`${javaAddr}\``);
        lines.push(`**Players:** ${java.players?.online ?? 0} / ${java.players?.max ?? 0}`);
        lines.push(`**Version:** ${java.version || '?'}`);
        if (motd) lines.push(`**MOTD:**\n\`\`\`\n${motd.slice(0, 200)}\n\`\`\``);
      }
      e.addFields({ name: '☕ Java', value: lines.join('\n'), inline: false });

      // Show server icon if available
      if (java.icon && typeof java.icon === 'string' && java.icon.startsWith('data:image')) {
        // Discord can't render base64 directly; skip thumbnail for icon.
      }
    } else {
      e.addFields({ name: '☕ Java', value: '⚠️ Could not reach the status API.', inline: false });
    }

    // Bedrock
    if (bedrock) {
      const lines = [];
      lines.push(`**Status:** ${bedrock.online ? '🟢 Online' : '🔴 Offline'}`);
      if (bedrock.online) {
        lines.push(`**Address:** \`${bedrockHost}:${bedrockPort}\``);
        lines.push(`**Players:** ${bedrock.players?.online ?? 0} / ${bedrock.players?.max ?? 0}`);
        if (bedrock.version) lines.push(`**Version:** ${bedrock.version}`);
      }
      e.addFields({ name: '📱 Bedrock', value: lines.join('\n'), inline: false });
    } else {
      e.addFields({ name: '📱 Bedrock', value: '⚠️ Could not reach the status API.', inline: false });
    }

    await loading.edit({ embeds: [e] });
  },
};
