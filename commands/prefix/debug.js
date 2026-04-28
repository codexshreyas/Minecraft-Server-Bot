const embed = require('../../utils/embed');
const perms = require('../../utils/permissions');

function fmtUptime(s) {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return `${d}d ${h}h ${m}m ${sec}s`;
}

module.exports = {
  name: 'debug',
  description: 'Show bot debug info (developers only)',
  async execute(message, args, client) {
    if (!perms.isDeveloper(message.author.id)) {
      return message.reply({ embeds: [embed.error('Permission Denied', 'Only developers can view debug info.')] });
    }
    const mem = process.memoryUsage();
    const e = embed.info('🔧 Debug Information')
      .addFields(
        { name: 'Uptime', value: fmtUptime(process.uptime()), inline: true },
        { name: 'WebSocket Ping', value: `${client.ws.ping}ms`, inline: true },
        { name: 'Node', value: process.version, inline: true },
        { name: 'Guilds', value: `${client.guilds.cache.size}`, inline: true },
        { name: 'Users (cached)', value: `${client.users.cache.size}`, inline: true },
        { name: 'Memory', value: `${(mem.rss / 1024 / 1024).toFixed(1)} MB`, inline: true },
        { name: 'Prefix Commands', value: `${new Set(client.prefixCommands.values()).size}`, inline: true },
        { name: 'Slash Commands', value: `${client.slashCommands.size}`, inline: true },
      );
    await message.reply({ embeds: [e] });
  },
};
