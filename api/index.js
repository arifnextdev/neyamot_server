// Vercel serverless function handler
// Loads the NestJS application from api/dist

module.exports = async (req, res) => {
  try {
    // Import the compiled application
    // node_modules is either symlinked or will be resolved from parent
    const handler = require('./dist/main.js').default;
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
