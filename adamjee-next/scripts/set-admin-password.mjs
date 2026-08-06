/**
 * Create or update an admin account.
 *
 * The old login route contained a hardcoded master-password backdoor that
 * doubled as the way admins signed in. That backdoor is gone, so this script is
 * now the supported way to provision or recover an admin login.
 *
 * Usage:
 *   node scripts/set-admin-password.mjs <email> <password>
 *
 * Example:
 *   node scripts/set-admin-password.mjs admin@adamjeecomputers.com 'a-long-unique-password'
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const [, , emailArg, passwordArg] = process.argv;

if (!emailArg || !passwordArg) {
  console.error('Usage: node scripts/set-admin-password.mjs <email> <password>');
  process.exit(1);
}

const email = emailArg.trim().toLowerCase();
const password = passwordArg;

// Hard floor matches the User schema's minlength.
if (password.length < 8) {
  console.error('Refusing to set an admin password shorter than 8 characters.');
  process.exit(1);
}

// These were hardcoded in the old login backdoor, so they are published in the
// repository's git history. Warn loudly but let the operator decide.
const KNOWN_LEAKED = ['admin123', 'admin', 'adminadmin', 'adamjee123', 'Admin@123'];
if (password.length < 12 || KNOWN_LEAKED.includes(password)) {
  console.warn('⚠️  WARNING: this password is weak or appears in this repo\'s git history.');
  console.warn('⚠️  Anyone with access to the source can guess it. Rotate it before going live.');
}

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGO_URI (or MONGODB_URI) is not set in your environment.');
  process.exit(1);
}

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
const users = mongoose.connection.db.collection('users');

const hashed = await bcrypt.hash(password, 12);
const now = new Date();

const existing = await users.findOne({ email });

if (existing) {
  await users.updateOne(
    { _id: existing._id },
    {
      $set: { password: hashed, role: 'admin', isActive: true, updatedAt: now },
      $unset: { resetPasswordToken: '', resetPasswordExpires: '' },
    }
  );
  console.log(`✅ Updated existing account ${email} — role: admin, password reset.`);
} else {
  await users.insertOne({
    name: 'Adamjee Admin',
    email,
    password: hashed,
    role: 'admin',
    phone: '',
    profilePicture: '',
    addresses: [],
    wishlist: [],
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
  console.log(`✅ Created new admin account ${email}.`);
}

await mongoose.disconnect();
console.log('Done. Sign in at /admin with these credentials.');
