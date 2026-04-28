const embed = require('../../utils/embed');
const config = require('../../config.json');

module.exports = {
  name: 'website',
  aliases: ['site', 'web'],
  description: 'Show the server website',
  async execute(message) {
    await message.reply({ embeds: [embed.info('🌐 Website', config.server.website || '_No website configured yet._')] });
  },
};
