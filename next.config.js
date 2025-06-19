// This file intentionally breaks Next.js detection
// by creating an invalid Next.js config that forces
// Bolt to treat this as a Node.js project instead

module.exports = {
  // Invalid Next.js config to prevent auto-detection
  experimental: {
    invalidOption: true
  },
  // Force error to prevent Next.js from starting
  webpack: () => {
    throw new Error('This is not a Next.js project - use npm run dev');
  }
};