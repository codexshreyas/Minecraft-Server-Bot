const embed = require('../../utils/embed');
const perms = require('../../utils/permissions');
const config = require('../../config.json');

const PREMIUM_COMMANDS = [
  { name: 'announce',     description: 'Send a styled server-wide announcement' },
  { name: 'embedbuilder', description: 'Build custom rich embeds with full styling' },
  { name: 'mass-dm',      description: 'Send DMs to multiple users at once' },
  { name: 'autoreact',    description: 'Auto-react to messages in selected channels' },
  { name: 'reactionrole', description: 'Set up reaction roles with custom emojis' },
  { name: 'ticketpanel',  description: 'Premium ticket panels with categories' },
  { name: 'welcomecard',  description: 'Custom welcome card images for new members' },
  { name: 'aichat',       description: 'AI-powered chat replies (premium)' },
  { name: 'serverstats',  description: 'Live updating server stats channels' },
  { name: 'customprefix', description: 'Set per-guild custom command prefix' },
];

module.exports = {
  name: 'premiumcommands',
  aliases: ['premiumcmds', 'pcmds', 'pc'],
  description: 'View premium-only commands',
  async execute(message, args, client) {
    const isPrem = perms.isPremium(message.author.id);

    const list = PREMIUM_COMMANDS
      .map((c) => `• \`${config.defaultPrefix}${c.name}\` — ${c.description}`)
      .join('\n');

    const e = embed.base()
      .setColor(isPrem ? '#F4C542' : '#1B6CA8')
      .setTitle('💎 Premium Commands')
      .setDescription(
        `${isPrem ? '✅ You **have premium** — enjoy these commands!' : '🔒 These commands are **locked** to premium users.'}\n\n${list}`
      )
      .addFields({
        name: 'How to get Premium?',
        value: isPrem
          ? 'You already have premium access. Thank you for supporting us! 💖'
          : `Ask a developer to grant premium with \`${config.defaultPrefix}premiumuser add @you\`.`
      });

    await message.reply({ embeds: [e] });
  },
};
