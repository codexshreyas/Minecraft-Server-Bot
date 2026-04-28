const log = require('../utils/logger');
const { ActivityType } = require('discord.js');
const config = require('../config.json');

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
  name: 'ready',
  once: true,
  execute(client) {
    log.success(`Logged in as ${client.user.tag}`);
    log.info(`Serving ${client.guilds.cache.size} guild(s)`);

    const p = config.presence || {};
    const status = VALID_STATUSES.includes(p.status) ? p.status : 'online';
    const activityType = ACTIVITY_MAP[(p.activityType || 'listening').toLowerCase()] ?? ActivityType.Listening;
    const activityName = p.activityName || 'p!help | @mention me';

    client.user.setPresence({
      activities: [{ name: activityName, type: activityType }],
      status,
    });
    log.info(`Presence set: status=${status}, activity=${p.activityType || 'Listening'} "${activityName}"`);
  },
};
