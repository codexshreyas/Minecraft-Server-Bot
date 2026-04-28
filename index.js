require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const log = require('./utils/logger');

if (!process.env.DISCORD_TOKEN) {
  log.error('Missing DISCORD_TOKEN. Set it in Replit Secrets.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.prefixCommands = new Collection();
client.slashCommands = new Collection();
client.cooldowns = new Collection();
client.config = require('./config.json');

// Load prefix commands
const prefixDir = path.join(__dirname, 'commands', 'prefix');
if (fs.existsSync(prefixDir)) {
  for (const file of fs.readdirSync(prefixDir).filter((f) => f.endsWith('.js'))) {
    try {
      const cmd = require(path.join(prefixDir, file));
      if (cmd?.name && typeof cmd.execute === 'function') {
        client.prefixCommands.set(cmd.name.toLowerCase(), cmd);
        if (Array.isArray(cmd.aliases)) {
          for (const a of cmd.aliases) client.prefixCommands.set(a.toLowerCase(), cmd);
        }
      }
    } catch (e) {
      log.error(`Failed to load prefix command ${file}:`, e.message);
    }
  }
}
log.info(`Loaded ${new Set(client.prefixCommands.values()).size} prefix commands`);

// Load slash commands
const slashDir = path.join(__dirname, 'commands', 'slash');
if (fs.existsSync(slashDir)) {
  for (const file of fs.readdirSync(slashDir).filter((f) => f.endsWith('.js'))) {
    try {
      const cmd = require(path.join(slashDir, file));
      if (cmd?.data && typeof cmd.execute === 'function') {
        client.slashCommands.set(cmd.data.name, cmd);
      }
    } catch (e) {
      log.error(`Failed to load slash command ${file}:`, e.message);
    }
  }
}
log.info(`Loaded ${client.slashCommands.size} slash commands`);

// Load events
const eventsDir = path.join(__dirname, 'events');
if (fs.existsSync(eventsDir)) {
  for (const file of fs.readdirSync(eventsDir).filter((f) => f.endsWith('.js'))) {
    const event = require(path.join(eventsDir, file));
    if (!event?.name) continue;
    if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
    else client.on(event.name, (...args) => event.execute(...args, client));
  }
}
log.info('Event handlers registered');

process.on('unhandledRejection', (err) => log.error('Unhandled rejection:', err));
process.on('uncaughtException', (err) => log.error('Uncaught exception:', err));

client.login(process.env.DISCORD_TOKEN).catch((e) => {
  log.error('Login failed:', e.message);
  process.exit(1);
});
