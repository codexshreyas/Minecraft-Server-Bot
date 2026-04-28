const embed = require('../../utils/embed');
const config = require('../../config.json');

module.exports = {
  name: 'support',
  aliases: ['discord', 'invite'],
  description: 'Get the support / invite links',
  async execute(message, args, client) {
    const inviteUrl = config.links?.invite ||
      `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=268823632&scope=bot%20applications.commands`;
    const supportUrl = config.links?.support || config.server?.supportInvite || '_Not set_';

    await message.reply({ embeds: [
      embed.info('🤝 Support & Links',
        `**Invite the bot:** ${inviteUrl}\n` +
        `**Support server:** ${supportUrl}\n` +
        `**Website:** ${config.server.website || '_Not set_'}`
      )
    ] });
  },
};
