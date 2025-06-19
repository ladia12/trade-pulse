// Force Bolt to recognize this as a fullstack application
module.exports = {
  type: 'fullstack',
  framework: 'fullstack',
  startCommand: 'npm run dev',
  preventNextDev: true,
  commands: {
    dev: 'npm run dev',
    start: 'npm run dev'
  }
};