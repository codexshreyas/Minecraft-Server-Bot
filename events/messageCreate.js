const log = require('../utils/logger');
const embed = require('../utils/embed');
const cooldown = require('../utils/cooldown');
const autoSolver = require('../utils/autoSolver');
const config = require('../config.json');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;

    if (process.env.DEBUG === 'true') {
      log.debug(`📨 ${message.author.tag}: "${message.content}"`);
    }

    // ===== Mention reply (when someone @mentions the bot with no command) =====
    const mentionRegex = new RegExp(`^<@!?${client.user.id}>\\s*$`);
    if (mentionRegex.test(message.content.trim())) {
      const guildPrefix = config.defaultPrefix;
      const e = new EmbedBuilder()
        .setColor(config.embedColor || '#1B6CA8')
        .setAuthor({ name: `${client.user.username} - Your Ultimate SMP Mate`, iconURL: client.user.displayAvatarURL() })
        .setDescription(
          `Hey there! 👋\n\n` +
          `• **Default Prefix:** \`${guildPrefix}\`\n` +
          `• **Server Prefix:** \`${guildPrefix}\`\n` +
          `• Type \`${guildPrefix}help\` to see my commands.`
        )
        .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
        .setFooter({ text: config.footerText, iconURL: config.footerIcon });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Invite Me')
          .setStyle(ButtonStyle.Link)
          .setURL(config.links?.invite || `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=268823632&scope=bot%20applications.commands`),
        new ButtonBuilder()
          .setLabel('Support Server')
          .setStyle(ButtonStyle.Link)
          .setURL(config.links?.support || config.server?.supportInvite || 'https://discord.gg/discord')
      );

      try { await message.reply({ embeds: [e], components: [row], allowedMentions: { repliedUser: false } }); } catch {}
      return;
    }

    // ===== Prefix command handler =====
    const prefix = config.defaultPrefix;
    if (!message.content.startsWith(prefix)) {
      // Try auto-solver for common questions
      autoSolver.check(message).catch(() => {});
      return;
    }

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    const command = client.prefixCommands.get(commandName);
    if (!command) return;

    if (config.maintenance && !require('../utils/permissions').isDeveloper(message.author.id)) {
      return message.reply({ embeds: [embed.warn('Maintenance', 'The bot is currently under maintenance. Please try again later.')] });
    }

    const cdLeft = cooldown.check(message.author.id, command.name, command.cooldown || config.cooldownSeconds || 3);
    if (cdLeft > 0) {
      return message.reply({ embeds: [embed.warn('Slow down!', `Please wait **${cdLeft}s** before using \`${command.name}\` again.`)] });
    }

    try {
      await command.execute(message, args, client);
    } catch (err) {
      log.error(`Error in command ${command.name}:`, err);
      try {
        await message.reply({ embeds: [embed.error('Command Error', `\`\`\`${err.message}\`\`\``)] });
      } catch {}
    }
  },
};
