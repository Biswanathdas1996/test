const mongoose = require('mongoose');

let _mongoServer = null;

async function connectDB() {
  try {
    const useMemory = process.env.USE_MEMORY_MONGO === '1';

    let uri = process.env.MONGO_URI;

    if (useMemory) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      _mongoServer = await MongoMemoryServer.create();
      uri = _mongoServer.getUri();
      console.log('Using in-memory MongoDB');
    }

    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

async function disconnectDB() {
  await mongoose.connection.close();
  if (_mongoServer) {
    await _mongoServer.stop();
  }
}

module.exports = { connectDB, disconnectDB };
