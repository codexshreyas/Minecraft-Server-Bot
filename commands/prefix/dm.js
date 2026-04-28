const embed = require('../../utils/embed');
const perms = require('../../utils/permissions');
const config = require('../../config.json');

module.exports = {
  name: 'dm',
  description: 'Send a DM to a user (developers/owner)',
  async execute(message, args, client) {
    if (!perms.isDeveloper(message.author.id)) {
      return message.reply({ embeds: [embed.error('Permission Denied', 'Only developers can use this command.')] });
    }

    const target = message.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null);
    if (!target) {
      return message.reply({ embeds: [embed.warn('Usage', `\`${config.defaultPrefix}dm <@user|id> <message>\``)] });
    }

    const startIndex = message.mentions.users.first() ? 1 : 1;
    const content = args.slice(startIndex).join(' ').trim();
    if (!content) {
      return message.reply({ embeds: [embed.error('Missing Message', 'Provide a message to send.')] });
    }

    const dmEmbed = embed.info(`📬 Message from ${message.guild?.name || 'Pirate Helper'}`, content)
      .setFooter({ text: `Sent by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    try {
      await target.send({ embeds: [dmEmbed] });
      return message.reply({ embeds: [embed.success('DM Sent', `Successfully sent a DM to **${target.tag}**.`)] });
    } catch (err) {
      return message.reply({ embeds: [embed.error('DM Failed', `Could not send a DM to **${target.tag}**.\nThey may have DMs disabled.\n\n\`${err.message}\``)] });
    }
  },
};
