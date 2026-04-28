const ts = () => new Date().toISOString().split('T')[1].split('.')[0];
const fmt = (level, args) => `[${ts()}] ${level.padEnd(5)} ${args.map(a => typeof a === 'string' ? a : (a?.stack || JSON.stringify(a))).join(' ')}`;

module.exports = {
  info: (...a) => console.log(fmt('INFO', a)),
  warn: (...a) => console.warn(fmt('WARN', a)),
  error: (...a) => console.error(fmt('ERROR', a)),
  success: (...a) => console.log(fmt('OK', a)),
  debug: (...a) => { if (process.env.DEBUG === 'true') console.log(fmt('DEBUG', a)); },
};
