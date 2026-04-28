const embed = require('../../utils/embed');
const perms = require('../../utils/permissions');
const { read, write } = require('../../utils/store');
const config = require('../../config.json');
const path = require('path');
const fs = require('fs');

const CONFIG_PATH = path.join(__dirname, '..', '..', 'config.json');

function saveConfig() {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

module.exports = {
  name: 'dev',
  description: 'Manage developers (owner only)',
  async execute(message, args, client) {
    if (!perms.isOwner(message.author.id)) {
      return message.reply({ embeds: [embed.error('Permission Denied', 'Only the bot owner can manage developers.')] });
    }

    const sub = (args[0] || '').toLowerCase();
    const target = message.mentions.users.first() || (args[1] ? await client.users.fetch(args[1]).catch(() => null) : null);

    if (!sub || sub === 'list') {
      const devs = config.developers || [];
      const lines = devs.length
        ? devs.map((id) => `• <@${id}> (\`${id}\`)`).join('\n')
        : '_No developers added yet._';
      return message.reply({ embeds: [embed.info('🛠️ Developers', lines)] });
    }

    if (!['add', 'remove', 'rm'].includes(sub)) {
      return message.reply({ embeds: [embed.warn('Usage',
        `\`${config.defaultPrefix}dev list\`\n\`${config.defaultPrefix}dev add @user\`\n\`${config.defaultPrefix}dev remove @user\``
      )] });
    }

    if (!target) {
      return message.reply({ embeds: [embed.error('Missing User', 'Mention a user or provide a user ID.')] });
    }

    config.developers = Array.isArray(config.developers) ? config.developers : [];

    if (sub === 'add') {
      if (config.developers.includes(target.id)) {
        return message.reply({ embeds: [embed.warn('Already a Developer', `<@${target.id}> is already a developer.`)] });
      }
      config.developers.push(target.id);
      saveConfig();
      return message.reply({ embeds: [embed.success('Developer Added', `<@${target.id}> is now a developer.`)] });
    }

    if (sub === 'remove' || sub === 'rm') {
      if (!config.developers.includes(target.id)) {
        return message.reply({ embeds: [embed.warn('Not a Developer', `<@${target.id}> is not a developer.`)] });
      }
      config.developers = config.developers.filter((id) => id !== target.id);
      saveConfig();
      return message.reply({ embeds: [embed.success('Developer Removed', `<@${target.id}> is no longer a developer.`)] });
    }
  },
};
