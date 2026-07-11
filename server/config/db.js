import mongoose from 'mongoose';

let isConnecting = false;

mongoose.set('bufferCommands', false);

const connectDB = async (retries = 5, delayMs = 4000) => {
  if (mongoose.connection.readyState === 1) return;

  if (isConnecting) return;
  isConnecting = true;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      isConnecting = false;
      return;
    } catch (error) {
      console.error(`MongoDB attempt ${attempt}/${retries} failed: ${error.message}`);

      if (
        error.message.includes('whitelist')
        || error.message.includes('IP')
        || error.message.includes('Could not connect to any servers')
      ) {
        console.error('\n⚠️  MongoDB Atlas blocked this IP address.');
        console.error('   Fix: MongoDB Atlas → Network Access → Add IP Address');
        console.error('   • Click "Add Current IP Address", OR');
        console.error('   • Add 0.0.0.0/0 (allow from anywhere) for development\n');
      }

      if (attempt < retries) {
        console.log(`   Retrying in ${delayMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  isConnecting = false;
  console.error('❌ MongoDB unavailable. Server is running but database features will not work until connected.\n');
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected — scheduling reconnect...');
  setTimeout(() => connectDB(3, 5000), 5000);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

export default connectDB;
