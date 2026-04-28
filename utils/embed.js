const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

function base() {
  return new EmbedBuilder()
    .setColor(config.embedColor || '#1B6CA8')
    .setFooter({ text: config.footerText, iconURL: config.footerIcon })
    .setTimestamp();
}

function build(title, desc, color) {
  const e = base();
  if (color) e.setColor(color);
  if (title) e.setTitle(title);
  if (desc && String(desc).trim().length) e.setDescription(String(desc));
  return e;
}

module.exports = {
  base,
  info: (title, desc) => build(title, desc),
  success: (title, desc) => build(`✅ ${title}`, desc, '#43B581'),
  error: (title, desc) => build(`❌ ${title}`, desc, '#ED4245'),
  warn: (title, desc) => build(`⚠️ ${title}`, desc, '#FAA61A'),
};
