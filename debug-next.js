const path = require('path');
const origRelative = path.relative;
path.relative = function(from, to) {
  if (to === undefined || from === undefined) {
    console.error('=== HATA YAKALANDI ===');
    console.error('from:', JSON.stringify(from));
    console.error('to:', JSON.stringify(to));
    console.trace('Stack trace:');
    process.exit(1);
  }
  return origRelative.call(this, from, to);
};

const origResolve = path.resolve;
path.resolve = function(...args) {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === undefined) {
      console.error('=== path.resolve HATA ===');
      console.error('args:', JSON.stringify(args));
      console.trace('Stack trace:');
      process.exit(1);
    }
  }
  return origResolve.apply(this, args);
};

process.argv = [process.argv[0], 'next', 'dev', '-p', '3025'];
require('next/dist/bin/next');
