const embed = require('../../utils/embed');

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(' ');
}

module.exports = {
  name: 'runtime',
  aliases: ['uptime', 'online', 'since'],
  description: 'Show how long the bot has been online',
  async execute(message, args, client) {
    const uptimeMs = client.uptime || 0;
    const startedAt = Math.floor((Date.now() - uptimeMs) / 1000);

    const e = embed.info('⏱️ Bot Runtime')
      .addFields(
        { name: 'Uptime', value: `\`${formatDuration(uptimeMs)}\``, inline: true },
        { name: 'Online Since', value: `<t:${startedAt}:F>`, inline: true },
        { name: 'Relative', value: `<t:${startedAt}:R>`, inline: false },
      );

    await message.reply({ embeds: [e] });
  },
};
