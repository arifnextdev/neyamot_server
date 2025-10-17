// Vercel serverless function handler
// This imports the compiled NestJS app and forwards requests to it
const path = require('path');

module.exports = async (req, res) => {
  try {
    // Try to resolve the path to the compiled main.js (now in api/dist)
    const mainPath = path.join(__dirname, 'dist', 'src', 'main.js');
    const handler = require(mainPath).default;
    return handler(req, res);
  } catch (error) {
    console.error('Error loading handler:', error);
    console.error('__dirname:', __dirname);
    console.error('Attempted path:', path.join(__dirname, '..', 'dist', 'src', 'main.js'));
    
    // List what files are available
    const fs = require('fs');
    try {
      const rootFiles = fs.readdirSync(path.join(__dirname, '..'));
      console.error('Root directory contents:', rootFiles);
    } catch (e) {
      console.error('Could not list root directory:', e.message);
    }
    
    res.status(500).json({ 
      error: 'Failed to load application',
      message: error.message,
      stack: error.stack
    });
  }
};
