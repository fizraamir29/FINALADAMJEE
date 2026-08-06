import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, default: '' },
  subtext: { type: String, default: 'Premium Tech Products' },
  image: { type: String, default: '' },
  link: { type: String, default: '' },
  isDark: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
}, { timestamps: true });

// Auto-generate slug from name
collectionSchema.pre('save', async function (this: any) {
  if (this.isNew || this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!this.link) {
      this.link = `/category/all?category=${encodeURIComponent(this.name)}`;
    }
  }
});

export default mongoose.models.Collection || mongoose.model('Collection', collectionSchema);
