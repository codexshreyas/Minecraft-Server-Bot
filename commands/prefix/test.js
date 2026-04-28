const embed = require('../../utils/embed');

module.exports = {
  name: 'test',
  description: 'Test if the bot is responding',
  async execute(message) {
    const start = Date.now();
    const reply = await message.reply({ embeds: [embed.success('Bot is Responding!', `Response time: calculating...`)] });
    await reply.edit({ embeds: [embed.success('Bot is Responding!',
      `**Response Time:** ${Date.now() - start}ms\n**Timestamp:** ${new Date().toLocaleTimeString()}`
    )] });
  },
};
