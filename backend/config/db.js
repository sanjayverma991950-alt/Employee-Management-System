import mongoose from 'mongoose';
import dns from 'node:dns';

// Use Google DNS to resolve MongoDB Atlas SRV records (fixes restricted network DNS)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    console.log("Checking MONGO_URI...");
    console.log(process.env.MONGO_URI);

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      family: 4,  // Force IPv4 — avoids NAT64/IPv6 translation issues
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);

  } catch (error) {
    console.error("MongoDB Connection Error:");
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;