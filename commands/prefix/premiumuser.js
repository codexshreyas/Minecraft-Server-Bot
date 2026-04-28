const embed = require('../../utils/embed');
const perms = require('../../utils/permissions');
const config = require('../../config.json');
const path = require('path');
const fs = require('fs');

const CONFIG_PATH = path.join(__dirname, '..', '..', 'config.json');
function saveConfig() { fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2)); }

module.exports = {
  name: 'premiumuser',
  aliases: ['premium', 'pu'],
  description: 'Manage premium users (developers only)',
  async execute(message, args, client) {
    const sub = (args[0] || '').toLowerCase();

    // Anyone can list / check status
    if (!sub || sub === 'list') {
      const users = config.premiumUsers || [];
      const lines = users.length
        ? users.map((id) => `• <@${id}> (\`${id}\`)`).join('\n')
        : '_No premium users yet._';
      return message.reply({ embeds: [embed.info('💎 Premium Users', lines)] });
    }

    if (sub === 'check' || sub === 'status') {
      const target = message.mentions.users.first() || message.author;
      const isPrem = perms.isPremium(target.id);
      return message.reply({ embeds: [
        embed.info(
          `💎 Premium Status — ${target.tag}`,
          isPrem ? '✅ This user **has premium**.' : '❌ This user does **not** have premium.'
        )
      ] });
    }

    // Modifications require developer
    if (!perms.isDeveloper(message.author.id)) {
      return message.reply({ embeds: [embed.error('Permission Denied', 'Only developers can add or remove premium users.')] });
    }

    const target = message.mentions.users.first() || (args[1] ? await client.users.fetch(args[1]).catch(() => null) : null);

    if (!['add', 'remove', 'rm'].includes(sub)) {
      return message.reply({ embeds: [embed.warn('Usage',
        `\`${config.defaultPrefix}premiumuser list\`\n` +
        `\`${config.defaultPrefix}premiumuser check [@user]\`\n` +
        `\`${config.defaultPrefix}premiumuser add @user\`\n` +
        `\`${config.defaultPrefix}premiumuser remove @user\``
      )] });
    }

    if (!target) {
      return message.reply({ embeds: [embed.error('Missing User', 'Mention a user or provide a user ID.')] });
    }

    config.premiumUsers = Array.isArray(config.premiumUsers) ? config.premiumUsers : [];

    if (sub === 'add') {
      if (config.premiumUsers.includes(target.id)) {
        return message.reply({ embeds: [embed.warn('Already Premium', `<@${target.id}> is already a premium user.`)] });
      }
      config.premiumUsers.push(target.id);
      saveConfig();
      return message.reply({ embeds: [embed.success('💎 Premium Added', `<@${target.id}> now has premium access.`)] });
    }

    if (sub === 'remove' || sub === 'rm') {
      if (!config.premiumUsers.includes(target.id)) {
        return message.reply({ embeds: [embed.warn('Not Premium', `<@${target.id}> doesn't have premium.`)] });
      }
      config.premiumUsers = config.premiumUsers.filter((id) => id !== target.id);
      saveConfig();
      return message.reply({ embeds: [embed.success('Premium Removed', `<@${target.id}>'s premium has been revoked.`)] });
    }
  },
};
