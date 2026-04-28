const fs = require('fs');
const path = require('path');
const { ActivityType } = require('discord.js');
const embed = require('../../utils/embed');
const perms = require('../../utils/permissions');
const log = require('../../utils/logger');

const CONFIG_PATH = path.join(__dirname, '..', '..', 'config.json');
const VALID_STATUSES = ['online', 'idle', 'dnd', 'invisible'];
const ACTIVITY_MAP = {
  playing: ActivityType.Playing,
  streaming: ActivityType.Streaming,
  listening: ActivityType.Listening,
  watching: ActivityType.Watching,
  competing: ActivityType.Competing,
  custom: ActivityType.Custom,
};

module.exports = {
  name: 'setstatus',
  aliases: ['status-set', 'presence'],
  description: 'Change the bot\'s status (owner only). Usage: p!setstatus <online|idle|dnd|invisible> [activityType] [activity name...]',
  async execute(message, args, client) {
    if (!perms.isOwner(message.author.id)) {
      return message.reply({ embeds: [embed.error('Permission Denied', 'Only the bot owner can change the bot\'s status.')] });
    }

    const status = (args[0] || '').toLowerCase();
    if (!status || !VALID_STATUSES.includes(status)) {
      return message.reply({ embeds: [embed.warn('Usage',
        '`p!setstatus <online|idle|dnd|invisible> [activityType] [activity name...]`\n\n' +
        '**Examples:**\n' +
        '`p!setstatus dnd` — just change status\n' +
        '`p!setstatus online playing Minecraft`\n' +
        '`p!setstatus idle watching the SMP`\n\n' +
        '**Activity types:** Playing, Streaming, Listening, Watching, Competing, Custom'
      )] });
    }

    let activityType = null;
    let activityName = null;
    if (args[1]) {
      const maybeType = args[1].toLowerCase();
      if (ACTIVITY_MAP[maybeType] !== undefined) {
        activityType = maybeType;
        activityName = args.slice(2).join(' ').trim();
      } else {
        // No type given — treat the rest as the activity name, default to listening
        activityType = 'listening';
        activityName = args.slice(1).join(' ').trim();
      }
      if (!activityName) activityName = null;
    }

    // Update config file
    let cfg;
    try {
      cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch (err) {
      log.error('Failed to read config.json:', err);
      return message.reply({ embeds: [embed.error('Config Read Error', err.message)] });
    }

    cfg.presence = cfg.presence || {};
    cfg.presence.status = status;
    if (activityType) cfg.presence.activityType =
      activityType.charAt(0).toUpperCase() + activityType.slice(1);
    if (activityName) cfg.presence.activityName = activityName;

    try {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
    } catch (err) {
      log.error('Failed to write config.json:', err);
      return message.reply({ embeds: [embed.error('Config Write Error', err.message)] });
    }

    // Apply live without restart
    const finalActivityType = ACTIVITY_MAP[(cfg.presence.activityType || 'listening').toLowerCase()] ?? ActivityType.Listening;
    const finalActivityName = cfg.presence.activityName || 'p!help | @mention me';

    try {
      client.user.setPresence({
        activities: [{ name: finalActivityName, type: finalActivityType }],
        status,
      });
    } catch (err) {
      log.error('Failed to set presence:', err);
      return message.reply({ embeds: [embed.error('Presence Error', err.message)] });
    }

    return message.reply({ embeds: [embed.success('Status Updated',
      `**Status:** \`${status}\`\n**Activity:** ${cfg.presence.activityType || 'Listening'} **${finalActivityName}**\n\n_Saved to config and applied live._`
    )] });
  },
};
