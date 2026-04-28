const config = require('../../config.json');
const whitelist = require('./whitelist');

module.exports = {
  name: 'apply',
  description: `Shortcut for ${config.defaultPrefix}whitelist apply`,
  async execute(message, args, client) {
    return whitelist.execute(message, ['apply', ...args], client);
  },
};
