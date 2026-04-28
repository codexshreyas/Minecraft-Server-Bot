const embed = require('../../utils/embed');
const config = require('../../config.json');

module.exports = {
  name: 'rules',
  description: 'Show the server rules',
  async execute(message) {
    const e = embed.info(`📜 ${config.server.name} — Rules`,
      '**1.** Be respectful to all players and staff.\n' +
      '**2.** No griefing, stealing, or raiding.\n' +
      '**3.** No cheating, hacked clients, or exploits.\n' +
      '**4.** No spamming or advertising in chat.\n' +
      '**5.** Keep builds appropriate (no NSFW or offensive).\n' +
      '**6.** No PvP without consent.\n' +
      '**7.** Use common sense — don\'t ruin others\' fun.\n' +
      '**8.** Listen to staff. Their decisions are final.\n\n' +
      `Open a ticket if you have questions or reports.`
    );
    await message.reply({ embeds: [e] });
  },
};
