require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const log = require('./utils/logger');

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;
if (!DISCORD_TOKEN || !CLIENT_ID) {
  log.error('Missing DISCORD_TOKEN or CLIENT_ID in environment');
  process.exit(1);
}

const commands = [];
const slashDir = path.join(__dirname, 'commands', 'slash');
if (fs.existsSync(slashDir)) {
  for (const file of fs.readdirSync(slashDir).filter((f) => f.endsWith('.js'))) {
    const cmd = require(path.join(slashDir, file));
    if (cmd?.data) commands.push(cmd.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    log.info(`Deploying ${commands.length} slash commands…`);
    if (GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
      log.success(`Slash commands registered to guild ${GUILD_ID}`);
    } else {
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
      log.success('Slash commands registered globally');
    }
  } catch (err) {
    log.error('Deploy failed:', err);
    process.exit(1);
  }
})();
