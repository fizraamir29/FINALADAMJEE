import mongoose from 'mongoose';
import dns from 'dns';

// Only apply IPv4 DNS order on local environment, NEVER override Vercel internal DNS
if (!process.env.VERCEL) {
  try {
    if (dns.setDefaultResultOrder) {
      dns.setDefaultResultOrder('ipv4first');
    }
  } catch (e) {
    // Ignore
  }
}

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || '';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null, failedAt: 0, error: null };
}

const RETRY_AFTER_MS = 5_000;

export function getMongoError() {
  if (!MONGODB_URI) {
    return 'MONGO_URI or MONGODB_URI is not set in environment variables.';
  }
  return cached.error || null;
}

export async function connectDB() {
  if (!MONGODB_URI) {
    console.warn('⚠️ MONGO_URI / MONGODB_URI is not set in environment variables.');
    cached.error = 'MONGO_URI or MONGODB_URI is not set in environment variables.';
    return null;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (cached.failedAt && Date.now() - cached.failedAt < RETRY_AFTER_MS) {
    return null;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 1500,
      connectTimeoutMS: 1500,
      socketTimeoutMS: 5000,
      maxPoolSize: 3,
      minPoolSize: 1,
      maxIdleTimeMS: 10000,
    };

    cached.promise = (async () => {
      try {
        const mongooseInstance = await mongoose.connect(MONGODB_URI, opts);
        console.log('✅ MongoDB Connected Successfully');
        cached.failedAt = 0;
        cached.error = null;
        return mongooseInstance;
      } catch (err: any) {
        console.error('❌ MongoDB Connection Error:', err.message);
        cached.promise = null;
        cached.failedAt = Date.now();
        cached.error = err.message || String(err);
        return null;
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    cached.conn = null;
    return null;
  }

  return cached.conn;
}
