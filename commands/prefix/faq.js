const embed = require('../../utils/embed');
const config = require('../../config.json');

const TOPICS = {
  whitelist: {
    title: '📝 How to get whitelisted',
    body:
      `Use \`${config.defaultPrefix}whitelist apply <minecraft_username>\` in this server.\n` +
      `Staff will review and approve your application. You'll be DMed once accepted.`,
  },
  join: {
    title: '🎮 How to join the server',
    body:
      `**Java:** \`${config.server.javaIp}\` (Version ${config.server.javaVersion})\n` +
      `**Bedrock:** \`${config.server.bedrockIp}\` Port \`${config.server.bedrockPort}\`\n\n` +
      `Make sure you're whitelisted first — use \`${config.defaultPrefix}faq whitelist\`.`,
  },
  lag: {
    title: '🐢 Lag / connection issues',
    body:
      '• Check your internet connection.\n' +
      '• Lower your render distance to 8-12 chunks.\n' +
      '• Close background apps using bandwidth.\n' +
      '• Try reconnecting — your area may be loading.\n' +
      '• If it persists for everyone, staff is likely already on it.',
  },
  rules: {
    title: '📜 Server rules',
    body: `Use \`${config.defaultPrefix}rules\` to see the full rules.`,
  },
  ip: {
    title: '🌐 Server IP',
    body:
      `**Java:** \`${config.server.javaIp}\`\n` +
      `**Bedrock:** \`${config.server.bedrockIp}\` Port \`${config.server.bedrockPort}\``,
  },
};

module.exports = {
  name: 'faq',
  aliases: ['help-topic'],
  description: 'Quick answers — usage: p!faq <whitelist|join|lag|rules|ip>',
  async execute(message, args) {
    const topic = (args[0] || '').toLowerCase();
    if (!topic || !TOPICS[topic]) {
      const list = Object.keys(TOPICS).map((k) => `\`${k}\``).join(', ');
      return message.reply({ embeds: [embed.info('📚 FAQ Topics', `Usage: \`${config.defaultPrefix}faq <topic>\`\n\nAvailable topics: ${list}`)] });
    }
    const t = TOPICS[topic];
    await message.reply({ embeds: [embed.info(t.title, t.body)] });
  },
};
