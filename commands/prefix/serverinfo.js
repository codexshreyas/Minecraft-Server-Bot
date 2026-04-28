const embed = require('../../utils/embed');

module.exports = {
  name: 'serverinfo',
  aliases: ['si', 'guildinfo'],
  description: 'Show server information',
  async execute(message) {
    if (!message.guild) return message.reply({ embeds: [embed.error('Guild Only', 'Use this in a server.')] });
    const g = message.guild;
    const e = embed.info(`🏰 ${g.name}`)
      .setThumbnail(g.iconURL({ size: 256 }))
      .addFields(
        { name: 'ID', value: g.id, inline: true },
        { name: 'Owner', value: `<@${g.ownerId}>`, inline: true },
        { name: 'Members', value: `${g.memberCount}`, inline: true },
        { name: 'Channels', value: `${g.channels.cache.size}`, inline: true },
        { name: 'Roles', value: `${g.roles.cache.size}`, inline: true },
        { name: 'Created', value: `<t:${Math.floor(g.createdTimestamp / 1000)}:R>`, inline: true },
      );
    await message.reply({ embeds: [e] });
  },
};
