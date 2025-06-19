#!/usr/bin/env node

// This file tricks Bolt into thinking this is a Node.js project
// instead of a pure Next.js project, forcing it to use npm scripts

const { spawn } = require('child_process');

console.log('🚀 Starting Trade Pulse Full-Stack Application...');
console.log('📦 Running: npm run dev');

// Run the dev script
const child = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
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