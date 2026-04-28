const embed = require('../../utils/embed');
const config = require('../../config.json');

module.exports = {
  name: 'help',
  aliases: ['commands', 'h'],
  description: 'Show all available commands',
  async execute(message, args, client) {
    const all = new Set(client.prefixCommands.values());
    const lines = [...all].map((c) => `\`${config.defaultPrefix}${c.name}\` — ${c.description || 'No description'}`);
    const e = embed.info(`${client.user.username} — Commands`,
      `Prefix: \`${config.defaultPrefix}\`\n\n${lines.join('\n')}`
    );
    await message.reply({ embeds: [e] });
  },
};
