const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');
const config = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('Show all bot commands'),
  async execute(interaction, client) {
    const all = new Set(client.prefixCommands.values());
    const lines = [...all].map((c) => `\`${config.defaultPrefix}${c.name}\` — ${c.description || 'No description'}`);
    await interaction.reply({ embeds: [embed.info(`${client.user.username} — Commands`, lines.join('\n'))] });
  },
};
