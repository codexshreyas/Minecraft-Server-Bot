const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const embed = require('../../utils/embed');
const perms = require('../../utils/permissions');
const { read, write } = require('../../utils/store');
const log = require('../../utils/logger');
const config = require('../../config.json');

const FILE = 'whitelist.json';

function load() {
  return read(FILE, { applications: [], approved: [] });
}

function save(data) {
  write(FILE, data);
}

const USERNAME_RE = /^[A-Za-z0-9_]{3,16}$/;

module.exports = {
  name: 'whitelist',
  aliases: ['wl'],
  description: 'Whitelist system — apply, list, approve, deny, remove',
  async execute(message, args, client) {
    const sub = (args[0] || '').toLowerCase();
    const data = load();

    if (!sub || sub === 'help') {
      return message.reply({ embeds: [embed.info('📝 Whitelist Help',
        `\`${config.defaultPrefix}whitelist apply <minecraft_username>\` — apply for whitelist\n` +
        `\`${config.defaultPrefix}whitelist list\` — view approved players\n` +
        `\`${config.defaultPrefix}whitelist pending\` — view pending applications (staff)\n` +
        `\`${config.defaultPrefix}whitelist approve <@user|id>\` — approve (staff)\n` +
        `\`${config.defaultPrefix}whitelist deny <@user|id> [reason]\` — deny (staff)\n` +
        `\`${config.defaultPrefix}whitelist remove <@user|id>\` — remove (staff)\n` +
        `\`${config.defaultPrefix}whitelist check [@user]\` — check status`
      )] });
    }

    // ===== APPLY =====
    if (sub === 'apply') {
      const username = (args[1] || '').trim();
      if (!username) {
        return message.reply({ embeds: [embed.error('Missing Username',
          `Provide your Minecraft username:\n\`${config.defaultPrefix}whitelist apply <minecraft_username>\``
        )] });
      }
      if (!USERNAME_RE.test(username)) {
        return message.reply({ embeds: [embed.error('Invalid Username',
          'Minecraft usernames are 3-16 characters, letters, numbers, and underscores only.'
        )] });
      }

      const existingApproved = data.approved.find((a) => a.discordId === message.author.id);
      if (existingApproved) {
        return message.reply({ embeds: [embed.warn('Already Whitelisted',
          `You're already whitelisted as **${existingApproved.username}**.`
        )] });
      }
      const existingApp = data.applications.find((a) => a.discordId === message.author.id);
      if (existingApp) {
        return message.reply({ embeds: [embed.warn('Application Pending',
          `You already have a pending application as **${existingApp.username}**.\nPlease wait for staff to review it.`
        )] });
      }

      data.applications.push({
        discordId: message.author.id,
        discordTag: message.author.tag,
        username,
        appliedAt: Date.now(),
        guildId: message.guild?.id || null,
      });
      save(data);

      const userMsg = await message.reply({ embeds: [embed.success('✅ Application Submitted',
        `Your whitelist request for **${username}** has been sent.\nStaff will review it shortly. You'll get a DM when it's approved.`
      )] });

      // Notify whitelist channel if configured
      if (config.channels?.whitelistRequests && message.guild) {
        const channelId = config.channels.whitelistRequests;
        try {
          let ch = message.guild.channels.cache.get(channelId);
          if (!ch) {
            ch = await message.guild.channels.fetch(channelId).catch((e) => {
              log.warn(`Whitelist channel ${channelId} not found in guild ${message.guild.id}: ${e.message}`);
              return null;
            });
          }
          if (!ch) {
            // Channel isn't in this guild — try fetching globally via client
            ch = await client.channels.fetch(channelId).catch((e) => {
              log.warn(`Whitelist channel ${channelId} not accessible: ${e.message}`);
              return null;
            });
          }
          if (!ch) {
            log.warn(`Whitelist channel ${channelId} not found anywhere — skipping notification.`);
          } else if (!ch.isTextBased || !ch.isTextBased()) {
            log.warn(`Whitelist channel ${channelId} is not a text channel.`);
          } else {
            // Check perms in that guild
            const me = ch.guild?.members?.me;
            if (me) {
              const p = ch.permissionsFor(me);
              if (!p?.has('ViewChannel') || !p?.has('SendMessages') || !p?.has('EmbedLinks')) {
                log.warn(`Missing perms in whitelist channel ${channelId}. Need View/Send/EmbedLinks.`);
              }
            }

            const appEmbed = embed.info('📥 New Whitelist Application')
              .addFields(
                { name: 'Discord User', value: `<@${message.author.id}> (\`${message.author.tag}\`)`, inline: true },
                { name: 'Minecraft Username', value: `\`${username}\``, inline: true },
                { name: 'Submitted', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: false },
              )
              .setThumbnail(`https://mc-heads.net/avatar/${encodeURIComponent(username)}/128`);

            const row = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId(`wl_approve_${message.author.id}`)
                .setLabel('Approve')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅'),
              new ButtonBuilder()
                .setCustomId(`wl_deny_${message.author.id}`)
                .setLabel('Deny')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌'),
            );

            await ch.send({ embeds: [appEmbed], components: [row] });
            log.info(`Posted whitelist application from ${message.author.tag} to channel ${channelId}.`);
          }
        } catch (err) {
          log.error(`Failed to post whitelist application to ${channelId}:`, err);
        }
      } else if (!config.channels?.whitelistRequests) {
        log.warn('No whitelist channel configured (config.channels.whitelistRequests is empty).');
      }
      return;
    }

    // ===== CHECK =====
    if (sub === 'check' || sub === 'status') {
      const target = message.mentions.users.first() || message.author;
      const approved = data.approved.find((a) => a.discordId === target.id);
      const pending = data.applications.find((a) => a.discordId === target.id);
      let body;
      if (approved) body = `✅ **${target.tag}** is whitelisted as **${approved.username}**.`;
      else if (pending) body = `⏳ **${target.tag}** has a pending application as **${pending.username}**.`;
      else body = `❌ **${target.tag}** is not whitelisted and has no pending application.`;
      return message.reply({ embeds: [embed.info('📝 Whitelist Status', body)] });
    }

    // ===== LIST APPROVED =====
    if (sub === 'list') {
      if (!data.approved.length) {
        return message.reply({ embeds: [embed.info('✅ Approved Whitelist', '_No players whitelisted yet._')] });
      }
      const lines = data.approved
        .slice(0, 50)
        .map((a, i) => `${i + 1}. **${a.username}** — <@${a.discordId}>`)
        .join('\n');
      return message.reply({ embeds: [embed.info(`✅ Approved Whitelist (${data.approved.length})`, lines)] });
    }

    // ===== PENDING (staff) =====
    if (sub === 'pending') {
      if (!perms.isDeveloper(message.author.id)) {
        return message.reply({ embeds: [embed.error('Permission Denied', 'Only staff can view pending applications.')] });
      }
      if (!data.applications.length) {
        return message.reply({ embeds: [embed.info('⏳ Pending Applications', '_No pending applications._')] });
      }
      const lines = data.applications
        .slice(0, 30)
        .map((a, i) => `${i + 1}. **${a.username}** — <@${a.discordId}> _<t:${Math.floor(a.appliedAt / 1000)}:R>_`)
        .join('\n');
      return message.reply({ embeds: [embed.info(`⏳ Pending Applications (${data.applications.length})`, lines)] });
    }

    // Staff-only beyond this point
    if (!perms.isDeveloper(message.author.id)) {
      return message.reply({ embeds: [embed.error('Permission Denied', 'Only staff/developers can manage whitelist.')] });
    }

    const target = message.mentions.users.first() || (args[1] ? await client.users.fetch(args[1]).catch(() => null) : null);
    if (!target && ['approve', 'deny', 'remove'].includes(sub)) {
      return message.reply({ embeds: [embed.error('Missing User', 'Mention a user or provide a user ID.')] });
    }

    // ===== APPROVE =====
    if (sub === 'approve') {
      const appIdx = data.applications.findIndex((a) => a.discordId === target.id);
      if (appIdx === -1) {
        return message.reply({ embeds: [embed.warn('No Application', `<@${target.id}> has no pending whitelist application.`)] });
      }
      const app = data.applications.splice(appIdx, 1)[0];
      if (!data.approved.find((a) => a.discordId === target.id)) {
        data.approved.push({
          discordId: target.id,
          discordTag: app.discordTag,
          username: app.username,
          approvedAt: Date.now(),
          approvedBy: message.author.id,
        });
      }
      save(data);

      // DM the user
      try {
        await target.send({ embeds: [embed.success('🎉 You\'re Whitelisted!',
          `Your application for **${app.username}** on **${config.server.name}** has been approved.\n\n` +
          `**Java:** \`${config.server.javaIp}\`\n**Bedrock:** \`${config.server.bedrockIp}\` Port \`${config.server.bedrockPort}\`\n\n` +
          `Welcome aboard! 🏴‍☠️`
        )] });
      } catch {}

      return message.reply({ embeds: [embed.success('Approved', `<@${target.id}> approved as **${app.username}**.`)] });
    }

    // ===== DENY =====
    if (sub === 'deny') {
      const appIdx = data.applications.findIndex((a) => a.discordId === target.id);
      if (appIdx === -1) {
        return message.reply({ embeds: [embed.warn('No Application', `<@${target.id}> has no pending application.`)] });
      }
      const app = data.applications.splice(appIdx, 1)[0];
      const reason = args.slice(message.mentions.users.first() ? 2 : 2).join(' ').trim() || 'No reason provided';
      save(data);

      try {
        await target.send({ embeds: [embed.warn('❌ Whitelist Denied',
          `Your whitelist application for **${app.username}** on **${config.server.name}** was denied.\n\n**Reason:** ${reason}`
        )] });
      } catch {}

      return message.reply({ embeds: [embed.success('Denied', `<@${target.id}>'s application was denied.\nReason: ${reason}`)] });
    }

    // ===== REMOVE =====
    if (sub === 'remove' || sub === 'rm') {
      const idx = data.approved.findIndex((a) => a.discordId === target.id);
      if (idx === -1) {
        return message.reply({ embeds: [embed.warn('Not Whitelisted', `<@${target.id}> isn't on the whitelist.`)] });
      }
      const removed = data.approved.splice(idx, 1)[0];
      save(data);
      return message.reply({ embeds: [embed.success('Removed', `Removed **${removed.username}** (<@${target.id}>) from the whitelist.`)] });
    }

    return message.reply({ embeds: [embed.warn('Unknown Subcommand',
      `Use \`${config.defaultPrefix}whitelist help\` to see available subcommands.`
    )] });
  },
};
