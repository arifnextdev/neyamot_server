// Vercel serverless function handler
// Simple proxy to the compiled NestJS app in the parent dist folder

module.exports = async (req, res) => {
  try {
    // Import from parent dist folder where node_modules resolution works correctly
    const handler = require('../dist/main.js').default;
    return handler(req, res);
  } catch (error) {
    console.error('Error loading handler:', error);
    res.status(500).json({
      error: 'Failed to load application',
      message: error.message,
      stack: error.stack
    });
  }
};
