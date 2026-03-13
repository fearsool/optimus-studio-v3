#!/usr/bin/env node

/**
 * Custom dev server starter to bypass Next.js watchpack issues
 * with paths containing spaces and special characters
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Optimus Studio Development Server...\n');
console.log('📁 Working Directory:', process.cwd());
console.log('🌐 Server will be available at: http://localhost:3025\n');

// Set environment variables
process.env.WATCHPACK_POLLING = 'true';
process.env.CHOKIDAR_USEPOLLING = 'true';
process.env.FORCE_COLOR = '1';

// Start Next.js with custom options
const nextDev = spawn('npx', ['next', 'dev', '-p', '3025', '--turbo'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=4096'
  }
});

nextDev.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

nextDev.on('close', (code) => {
  if (code !== 0) {
    console.log(`\n⚠️  Server exited with code ${code}`);
  }
  process.exit(code);
});

// Handle termination
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down Optimus Studio...');
  nextDev.kill('SIGINT');
});

process.on('SIGTERM', () => {
  nextDev.kill('SIGTERM');
});
