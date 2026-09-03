import mongoose from 'mongoose';
import dns from 'node:dns';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env variables are loaded from backend/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

// Use Google DNS to resolve MongoDB Atlas SRV records (fixes restricted network DNS)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (dnsErr) {
  console.warn('Custom DNS setServer warning:', dnsErr.message);
}

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ems';
    console.log('Connecting to MongoDB...');

    const conn = await mongoose.connect(mongoUri, {
      family: 4,  // Force IPv4 — avoids NAT64/IPv6 translation issues
      serverSelectionTimeoutMS: 15000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    console.error('If using MongoDB Atlas, check your network connection or IP whitelist.');
    process.exit(1);
  }
};

export default connectDB;