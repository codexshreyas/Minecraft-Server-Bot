const cooldowns = new Map();

function check(userId, commandName, seconds = 3) {
  const key = `${userId}:${commandName}`;
  const now = Date.now();
  const expires = cooldowns.get(key) || 0;
  if (now < expires) {
    return Math.ceil((expires - now) / 1000);
  }
  cooldowns.set(key, now + seconds * 1000);
  return 0;
}

module.exports = { check };
