const embed = require('../../utils/embed');
const config = require('../../config.json');

module.exports = {
  name: 'ip',
  aliases: ['java', 'address'],
  description: 'Show the Java server IP',
  async execute(message) {
    const e = embed.info('🏴‍☠️ Java Edition IP', `**IP:** \`${config.server.javaIp}\`\n**Version:** ${config.server.javaVersion}`)
      .addFields(
        { name: 'Bedrock Players?', value: `Use \`${config.defaultPrefix}bedrock\` to get the Bedrock IP/Port.`, inline: false }
      );
    await message.reply({ embeds: [e] });
  },
};
