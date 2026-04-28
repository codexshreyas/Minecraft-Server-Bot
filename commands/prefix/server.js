const embed = require('../../utils/embed');
const config = require('../../config.json');

module.exports = {
  name: 'server',
  aliases: ['serverinfo-mc', 'smp'],
  description: 'Show all server connection info',
  async execute(message) {
    const s = config.server;
    const e = embed.info(`🏴‍☠️ ${s.name}`)
      .addFields(
        { name: '☕ Java IP', value: `\`${s.javaIp}\``, inline: true },
        { name: '🎮 Version', value: s.javaVersion, inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        { name: '📱 Bedrock IP', value: `\`${s.bedrockIp}\``, inline: true },
        { name: '📱 Bedrock Port', value: `\`${s.bedrockPort}\``, inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        { name: '🌐 Website', value: s.website || '_Not set_', inline: false },
      );
    await message.reply({ embeds: [e] });
  },
};
