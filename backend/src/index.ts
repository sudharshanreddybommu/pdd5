import app from './app.js';
import { config } from './config/index.js';
import { seedInitialData } from './database/seed.js';
import { connectMongoDB } from './database/mongodb.js';

async function startServer() {
  try {
    // 1. Seed initial data
    await seedInitialData();

    // 2. Connect to MongoDB & sync data
    await connectMongoDB();

    app.listen(config.port, '0.0.0.0', () => {
      console.log(`\n======================================================`);
      console.log(`🚀 OPMD Care Backend Server running on port ${config.port}`);
      console.log(`🌐 Health API: http://localhost:${config.port}/api/health`);
      console.log(`📱 Mobile LAN API: http://172.23.50.66:${config.port}/api`);
      console.log(`📁 Uploads Directory: ${config.uploadsDir}`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
