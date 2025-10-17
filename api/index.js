// Vercel serverless function handler
// This imports the compiled NestJS app and forwards requests to it

module.exports = async (req, res) => {
  // Import the compiled serverless handler from dist/src/main.js
  const handler = require('../dist/src/main.js').default;
  return handler(req, res);
};
