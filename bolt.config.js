module.exports = {
  framework: 'node',
  type: 'backend',
  commands: {
    dev: 'node server.js',
    start: 'node server.js'
  },
  port: 3000,
  scripts: {
    dev: 'node server.js',
    start: 'node server.js'
  },
  startCommand: 'node server.js',
  disableNextDev: true,
  preventDirectNextDev: true,
  preventNextDev: true,
  preventAutoDetection: true,
  forceFramework: 'node'
};