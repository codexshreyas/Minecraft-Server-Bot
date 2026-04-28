const fs = require('fs');
const path = require('path');
const embed = require('../../utils/embed');
const perms = require('../../utils/permissions');
const log = require('../../utils/logger');

const PREFIX_DIR = path.join(__dirname, '..', '..', 'commands', 'prefix');
const SLASH_DIR = path.join(__dirname, '..', '..', 'commands', 'slash');
const UTILS_DIR = path.join(__dirname, '..', '..', 'utils');
const CONFIG_PATH = path.join(__dirname, '..', '..', 'config.json');

function clearRequireCache(targetPath) {
  const resolved = require.resolve(targetPath);
  delete require.cache[resolved];
}

function reloadAllInDir(dir, collection, kind) {
  const stats = { loaded: 0, failed: [] };
  if (!fs.existsSync(dir)) return stats;
  collection.clear();

  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.js'))) {
    const full = path.join(dir, file);
    try {
      clearRequireCache(full);
      const cmd = require(full);

      if (kind === 'prefix') {
        if (cmd?.name && typeof cmd.execute === 'function') {
          collection.set(cmd.name.toLowerCase(), cmd);
          if (Array.isArray(cmd.aliases)) {
            for (const a of cmd.aliases) collection.set(a.toLowerCase(), cmd);
          }
          stats.loaded++;
        }
      } else if (kind === 'slash') {
        if (cmd?.data && typeof cmd.execute === 'function') {
          collection.set(cmd.data.name, cmd);
          stats.loaded++;
        }
      }
    } catch (err) {
      log.error(`Failed to reload ${kind} command ${file}:`, err.message);
      stats.failed.push(`${file}: ${err.message}`);
    }
  }
  return stats;
}

function clearUtilsCache() {
  if (!fs.existsSync(UTILS_DIR)) return 0;
  let count = 0;
  for (const file of fs.readdirSync(UTILS_DIR).filter((f) => f.endsWith('.js'))) {
    const full = path.join(UTILS_DIR, file);
    try {
      clearRequireCache(full);
      count++;
    } catch {}
  }
  return count;
}

module.exports = {
  name: 'reload',
  aliases: ['rl'],
  description: 'Hot-reload commands, utils, and config (owner only). Usage: p!reload [commands|config|all]',
  async execute(message, args, client) {
    if (!perms.isOwner(message.author.id)) {
      return message.reply({ embeds: [embed.error('Permission Denied', 'Only the bot owner can hot-reload modules.')] });
    }

    const target = (args[0] || 'all').toLowerCase();
    const lines = [];
    let hasError = false;

    if (target === 'config' || target === 'all') {
      try {
        clearRequireCache(CONFIG_PATH);
        client.config = require(CONFIG_PATH);
        lines.push('✅ **Config** reloaded');
      } catch (err) {
        hasError = true;
        lines.push(`❌ **Config** failed: ${err.message}`);
      }
    }

    if (target === 'commands' || target === 'all') {
      // Clear utils cache first so commands pick up changes to shared helpers
      const utilsCleared = clearUtilsCache();
      lines.push(`🔄 Cleared **${utilsCleared}** util module(s) from cache`);

      const prefix = reloadAllInDir(PREFIX_DIR, client.prefixCommands, 'prefix');
      lines.push(`✅ **Prefix commands** reloaded: ${prefix.loaded}`);
      if (prefix.failed.length) {
        hasError = true;
        lines.push(`❌ Prefix failures:\n${prefix.failed.map((f) => `• ${f}`).join('\n')}`);
      }

      const slash = reloadAllInDir(SLASH_DIR, client.slashCommands, 'slash');
      lines.push(`✅ **Slash commands** reloaded: ${slash.loaded}`);
      if (slash.failed.length) {
        hasError = true;
        lines.push(`❌ Slash failures:\n${slash.failed.map((f) => `• ${f}`).join('\n')}`);
      }
    }

    if (!['commands', 'config', 'all'].includes(target)) {
      return message.reply({ embeds: [embed.warn('Usage',
        '`p!reload [commands|config|all]`\n\n' +
        '• `p!reload` — reload everything\n' +
        '• `p!reload commands` — only reload commands + utils\n' +
        '• `p!reload config` — only reload config.json'
      )] });
    }

    const e = hasError
      ? embed.warn('♻️ Reload Completed with Errors', lines.join('\n'))
      : embed.success('♻️ Reload Complete', lines.join('\n'));
    return message.reply({ embeds: [e] });
  },
};
