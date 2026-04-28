const embed = require('./embed');
const config = require('../config.json');

const cooldowns = new Map();
const CD_SECONDS = config.autoSolver?.cooldownSeconds ?? 30;

const TRIGGERS = [
  {
    keywords: ['cant join', "can't join", 'cannot join', 'unable to join', 'how to join', 'how do i join'],
    title: '🎮 Need help joining?',
    body: () =>
      `**Java:** \`${config.server.javaIp}\` (${config.server.javaVersion})\n` +
      `**Bedrock:** \`${config.server.bedrockIp}\` Port \`${config.server.bedrockPort}\`\n\n` +
      `Make sure you're whitelisted — use \`${config.defaultPrefix}whitelist apply <username>\`.`,
  },
  {
    keywords: ['whitelist', 'whitelisted', 'wl me', 'not whitelist'],
    title: '📝 Whitelist info',
    body: () => `Apply with \`${config.defaultPrefix}whitelist apply <minecraft_username>\`.\nStaff will review and DM you when approved.`,
  },
  {
    keywords: ['server ip', 'whats the ip', "what's the ip", 'ip pls', 'ip please', 'give me ip', 'send ip'],
    title: '🌐 Server IP',
    body: () => `**Java:** \`${config.server.javaIp}\`\n**Bedrock:** \`${config.server.bedrockIp}\` Port \`${config.server.bedrockPort}\``,
  },
  {
    keywords: ['lag', 'lagging', 'tps drop', 'low tps', 'choppy', 'stutter'],
    title: '🐢 Experiencing lag?',
    body: () =>
      '• Lower your render distance to 8-12 chunks.\n' +
      '• Close background apps using bandwidth.\n' +
      '• Reconnect — your chunks may still be loading.\n' +
      '• If it persists for everyone, staff is likely on it.',
  },
  {
    keywords: ['rules', 'server rules'],
    title: '📜 Server rules',
    body: () => `Use \`${config.defaultPrefix}rules\` to see all server rules.`,
  },
  {
    keywords: ['bedrock', 'mobile', 'pe ip', 'phone version'],
    title: '📱 Bedrock connection info',
    body: () => `**IP:** \`${config.server.bedrockIp}\`\n**Port:** \`${config.server.bedrockPort}\`\n\nGo to Servers → Add Server in Minecraft Bedrock.`,
  },
];

function tryMatch(text) {
  const lower = text.toLowerCase();
  for (const t of TRIGGERS) {
    if (t.keywords.some((k) => lower.includes(k))) return t;
  }
  return null;
}

async function check(message) {
  if (!config.autoSolver?.enabled) return false;
  if (!message.guild) return false;
  if (message.content.startsWith(config.defaultPrefix)) return false;

  const trigger = tryMatch(message.content);
  if (!trigger) return false;

  const key = `${message.channel.id}:${trigger.title}`;
  const now = Date.now();
  if ((cooldowns.get(key) || 0) > now) return false;
  cooldowns.set(key, now + CD_SECONDS * 1000);

  try {
    await message.reply({ embeds: [embed.info(trigger.title, trigger.body())], allowedMentions: { repliedUser: false } });
  } catch {}
  return true;
}

module.exports = { check };
