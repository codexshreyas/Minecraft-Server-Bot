const embed = require('../../utils/embed');
const perms = require('../../utils/permissions');

module.exports = {
  name: 'userinfo',
  aliases: ['ui', 'whois'],
  description: 'Show information about a user',
  async execute(message, args, client) {
    const target = message.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : message.author);
    if (!target) return message.reply({ embeds: [embed.error('User Not Found')] });
    const member = message.guild ? await message.guild.members.fetch(target.id).catch(() => null) : null;
    const e = embed.info(`👤 ${target.tag}`)
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'ID', value: target.id, inline: true },
        { name: 'Bot?', value: target.bot ? 'Yes' : 'No', inline: true },
        { name: 'Premium', value: perms.isPremium(target.id) ? '💎 Yes' : 'No', inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
      );
    if (member?.joinedTimestamp) {
      e.addFields({ name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true });
    }
    await message.reply({ embeds: [e] });
  },
};
