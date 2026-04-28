const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const log = require('../utils/logger');
const embed = require('../utils/embed');
const perms = require('../utils/permissions');
const { read, write } = require('../utils/store');
const config = require('../config.json');

const WL_FILE = 'whitelist.json';
function loadWL() { return read(WL_FILE, { applications: [], approved: [] }); }
function saveWL(data) { write(WL_FILE, data); }

async function handleWhitelistButton(interaction, client) {
  const [, action, userId] = interaction.customId.split('_'); // wl_approve_<id> | wl_deny_<id>

  if (!perms.isDeveloper(interaction.user.id)) {
    return interaction.reply({ embeds: [embed.error('Permission Denied', 'Only staff/developers can review whitelist applications.')], ephemeral: true });
  }

  const data = loadWL();
  const appIdx = data.applications.findIndex((a) => a.discordId === userId);
  if (appIdx === -1) {
    return interaction.reply({ embeds: [embed.warn('No Pending Application', 'This application has already been handled or no longer exists.')], ephemeral: true });
  }
  const app = data.applications[appIdx];
  const target = await client.users.fetch(userId).catch(() => null);

  if (action === 'approve') {
    data.applications.splice(appIdx, 1);
    if (!data.approved.find((a) => a.discordId === userId)) {
      data.approved.push({
        discordId: userId,
        discordTag: app.discordTag,
        username: app.username,
        approvedAt: Date.now(),
        approvedBy: interaction.user.id,
      });
    }
    saveWL(data);

    if (target) {
      try {
        await target.send({ embeds: [embed.success('🎉 You\'re Whitelisted!',
          `Your application for **${app.username}** on **${config.server.name}** has been approved.\n\n` +
          `**Java:** \`${config.server.javaIp}\`\n**Bedrock:** \`${config.server.bedrockIp}\` Port \`${config.server.bedrockPort}\`\n\n` +
          `Welcome aboard! 🏴‍☠️`
        )] });
      } catch {}
    }

    const updated = embed.success('✅ Whitelist Approved')
      .addFields(
        { name: 'Discord User', value: `<@${userId}> (\`${app.discordTag}\`)`, inline: true },
        { name: 'Minecraft Username', value: `\`${app.username}\``, inline: true },
        { name: 'Approved By', value: `<@${interaction.user.id}>`, inline: false },
      )
      .setThumbnail(`https://mc-heads.net/avatar/${encodeURIComponent(app.username)}/128`);

    const disabledRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('wl_done_approved').setLabel('Approved').setStyle(ButtonStyle.Success).setEmoji('✅').setDisabled(true),
    );

    return interaction.update({ embeds: [updated], components: [disabledRow] });
  }

  if (action === 'deny') {
    data.applications.splice(appIdx, 1);
    saveWL(data);

    if (target) {
      try {
        await target.send({ embeds: [embed.warn('❌ Whitelist Denied',
          `Your whitelist application for **${app.username}** on **${config.server.name}** was denied.\n\nIf you believe this was a mistake, contact staff.`
        )] });
      } catch {}
    }

    const updated = embed.error('❌ Whitelist Denied')
      .addFields(
        { name: 'Discord User', value: `<@${userId}> (\`${app.discordTag}\`)`, inline: true },
        { name: 'Minecraft Username', value: `\`${app.username}\``, inline: true },
        { name: 'Denied By', value: `<@${interaction.user.id}>`, inline: false },
      );

    const disabledRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('wl_done_denied').setLabel('Denied').setStyle(ButtonStyle.Danger).setEmoji('❌').setDisabled(true),
    );

    return interaction.update({ embeds: [updated], components: [disabledRow] });
  }
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      // Button interactions
      if (interaction.isButton()) {
        if (interaction.customId.startsWith('wl_approve_') || interaction.customId.startsWith('wl_deny_')) {
          return handleWhitelistButton(interaction, client);
        }
        return;
      }

      // Slash commands
      if (!interaction.isChatInputCommand()) return;
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction, client);
    } catch (err) {
      log.error(`Interaction error:`, err);
      const payload = { embeds: [embed.error('Command Error', `\`\`\`${err.message}\`\`\``)], ephemeral: true };
      if (interaction.replied || interaction.deferred) interaction.followUp(payload).catch(() => {});
      else interaction.reply(payload).catch(() => {});
    }
  },
};
