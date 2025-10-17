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
    console.error('Attempted path:', path.join(__dirname, 'dist', 'src', 'main.js'));
    
    // List what files are available
    const fs = require('fs');
    const debugInfo = {
      error: 'Failed to load application',
      message: error.message,
      __dirname: __dirname,
      attemptedPath: path.join(__dirname, 'dist', 'src', 'main.js')
    };
    
    try {
      debugInfo.apiDirContents = fs.readdirSync(__dirname);
      console.error('API directory contents:', debugInfo.apiDirContents);
      
      // Check if dist exists
      const distPath = path.join(__dirname, 'dist');
      if (fs.existsSync(distPath)) {
        debugInfo.distExists = true;
        debugInfo.distContents = fs.readdirSync(distPath);
        console.error('dist directory contents:', debugInfo.distContents);
      } else {
        debugInfo.distExists = false;
      }
      
      // Check parent directory
      const parentPath = path.join(__dirname, '..');
      debugInfo.parentDirContents = fs.readdirSync(parentPath);
      console.error('Parent directory contents:', debugInfo.parentDirContents);
    } catch (e) {
      debugInfo.debugError = e.message;
      console.error('Could not list directories:', e.message);
    }
    
    res.status(500).json(debugInfo);
  }
};
