// Vercel serverless function handler
// Loads the bundled NestJS application (created by @vercel/ncc)

module.exports = async (req, res) => {
  try {
    // Import the bundled application (includes all dependencies)
    const handler = require('./dist/index.js').default;
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
