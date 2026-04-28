const config = require('../config.json');

function isOwner(userId) {
  const envOwners = (process.env.OWNER_IDS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (envOwners.includes(userId)) return true;
  return Array.isArray(config.ownerIds) && config.ownerIds.includes(userId);
}

function isDeveloper(userId) {
  if (isOwner(userId)) return true;
  return Array.isArray(config.developers) && config.developers.includes(userId);
}

function isPremium(userId) {
  if (isDeveloper(userId)) return true;
  return Array.isArray(config.premiumUsers) && config.premiumUsers.includes(userId);
}

module.exports = { isOwner, isDeveloper, isPremium };
