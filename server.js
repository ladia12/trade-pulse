#!/usr/bin/env node

// Main entry point for Trade Pulse Full-Stack Application
// This forces Bolt to recognize this as a Node.js backend project

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Trade Pulse Full-Stack Application...');
console.log('📦 Framework: Node.js Backend with Next.js Frontend');
console.log('🔧 Running: npm run dev (concurrently)');

// Ensure we're in the right directory
process.chdir(__dirname);

// Run the dev script which starts both frontend and backend
const child = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

child.on('error', (error) => {
  console.error('❌ Failed to start application:', error);
  console.log('🔄 Trying alternative startup method...');
  
  // Fallback: start manually
  const concurrently = require('concurrently');
  concurrently([
    { command: 'npm run dev:frontend', name: 'frontend', prefixColor: 'cyan' },
    { command: 'npm run dev:backend', name: 'backend', prefixColor: 'magenta' }
  ], {
    prefix: 'name',
    killOthers: ['failure', 'success'],
    restartTries: 3
  }).catch(err => {
    console.error('❌ Concurrently failed:', err);
    process.exit(1);
  });
});

child.on('close', (code) => {
  console.log(`✅ Application exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  child.kill('SIGTERM');
});

// Export for potential require() usage
module.exports = {
  start: () => {
    console.log('📡 Trade Pulse server starting...');
  }
};