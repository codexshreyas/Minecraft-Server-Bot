const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Check bot latency'),
  async execute(interaction, client) {
    await interaction.reply({ embeds: [embed.info('🏓 Pong!', `WebSocket: ${client.ws.ping}ms`)] });
  },
};
