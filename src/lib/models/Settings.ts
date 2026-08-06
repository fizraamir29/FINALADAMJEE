import mongoose from 'mongoose';

/**
 * Store-wide settings. A single document, addressed by the fixed `key`, so the
 * values survive restarts and are shared across server instances — the previous
 * implementation kept them in a module-level object that silently reset on every
 * cold start and diverged between serverless invocations.
 */
const SettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'store', unique: true, index: true },
  promoTagline: {
    type: String,
    default: 'Save up to 60% with code BLACKFRIDAY • Free shipping over PKR 50,000 •',
  },
  storeName: { type: String, default: 'Adamjee Computers' },
  storePhone: { type: String, default: '+92 300 0000000' },
  storeEmail: { type: String, default: 'support@adamjeecomputers.com' },
}, { timestamps: true });

export const SETTINGS_FIELDS = ['promoTagline', 'storeName', 'storePhone', 'storeEmail'] as const;

export const DEFAULT_SETTINGS = {
  promoTagline: 'Save up to 60% with code BLACKFRIDAY • Free shipping over PKR 50,000 •',
  storeName: 'Adamjee Computers',
  storePhone: '+92 300 0000000',
  storeEmail: 'support@adamjeecomputers.com',
};

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
