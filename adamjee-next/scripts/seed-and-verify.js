const dns = require('dns');
dns.setDefaultResultOrder && dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const uri = process.env.MONGO_URI;

mongoose.connect(uri)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas');
    const db = mongoose.connection.db;
    
    // Check users
    const users = await db.collection('users').find({}).toArray();
    console.log('--- EXISTING USERS ---');
    users.forEach(u => console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`));

    // Ensure Admin account exists
    const adminEmail = 'admin@adamjee.com';
    let admin = users.find(u => u.email.toLowerCase() === adminEmail.toLowerCase() || u.role === 'admin');
    
    if (!admin) {
      console.log('Creating default admin account...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const res = await db.collection('users').insertOne({
        name: 'Adamjee Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Created admin account: admin@adamjee.com / admin123');
    } else {
      console.log(`✅ Admin account exists: ${admin.email} (Role: ${admin.role})`);
    }

    // Check products
    const productsCount = await db.collection('products').countDocuments();
    console.log(`--- PRODUCTS COUNT: ${productsCount} ---`);

    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
