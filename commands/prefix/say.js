const embed = require('../../utils/embed');
const perms = require('../../utils/permissions');

module.exports = {
  name: 'say',
  description: 'Make the bot say something (developers only)',
  async execute(message, args) {
    if (!perms.isDeveloper(message.author.id)) {
      return message.reply({ embeds: [embed.error('Permission Denied', 'Only developers can use this command.')] });
    }
    const text = args.join(' ').trim();
    if (!text) return message.reply({ embeds: [embed.warn('Usage', 'Provide text to say.')] });
    await message.delete().catch(() => {});
    await message.channel.send({ content: text, allowedMentions: { parse: [] } });
  },
};
