const embed = require('../../utils/embed');

module.exports = {
  name: 'avatar',
  aliases: ['av', 'pfp'],
  description: 'Show a user\'s avatar',
  async execute(message, args, client) {
    const target = message.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : message.author);
    if (!target) return message.reply({ embeds: [embed.error('User Not Found')] });
    const url = target.displayAvatarURL({ size: 1024, extension: 'png' });
    await message.reply({ embeds: [embed.info(`🖼️ ${target.tag}'s Avatar`).setImage(url)] });
  },
};
