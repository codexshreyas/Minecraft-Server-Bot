const embed = require('../../utils/embed');
const config = require('../../config.json');

module.exports = {
  name: 'bedrock',
  aliases: ['be', 'pe', 'mobile'],
  description: 'Show the Bedrock server IP and port',
  async execute(message) {
    const e = embed.info('📱 Bedrock Edition IP',
      `**IP:** \`${config.server.bedrockIp}\`\n**Port:** \`${config.server.bedrockPort}\``
    ).addFields({
      name: 'How to Join (Bedrock)',
      value: '1. Open Minecraft Bedrock\n2. Go to **Servers** → **Add Server**\n3. Enter the IP and Port above\n4. Click **Save** then **Join**',
    });
    await message.reply({ embeds: [e] });
  },
};
