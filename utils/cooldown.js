const cooldowns = {};

export function isSpamming(userId, command, cooldownMs) {
  const now = Date.now();
  cooldowns[userId] = cooldowns[userId] || {};

  if (!cooldowns[userId][command]) {
    cooldowns[userId][command] = now;
    return false;
  }

  const elapsed = now - cooldowns[userId][command];
  if (elapsed < cooldownMs) return true;

  cooldowns[userId][command] = now;
  return false;
}
