const dns = require('dns');
dns.setDefaultResultOrder && dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

mongoose.connect(uri)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    for (let c of collections) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`Collection "${c.name}": ${count} documents`);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection error:', err);
    process.exit(1);
  });
