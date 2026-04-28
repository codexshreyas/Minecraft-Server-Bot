const embed = require('../../utils/embed');

module.exports = {
  name: 'ping',
  description: 'Check bot latency',
  async execute(message, args, client) {
    const sent = await message.reply({ embeds: [embed.info('🏓 Pinging...')] });
    const latency = sent.createdTimestamp - message.createdTimestamp;
    const wsPing = client.ws.ping;
    await sent.edit({ embeds: [
      embed.info('🏓 Pong!', `**Roundtrip:** ${latency}ms\n**WebSocket:** ${wsPing}ms`),
    ] });
  },
};
