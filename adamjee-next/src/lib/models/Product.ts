import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const variationSchema = new mongoose.Schema({
  label: String,
  options: [{ value: String, priceModifier: Number }],
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Product name is required'], trim: true },
  slug: { type: String, unique: true, lowercase: true },
  code: { type: String, required: true },
  description: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  price: { type: Number, required: [true, 'Price is required'], min: 0 },
  comparePrice: { type: Number, default: 0 },
  tag: { type: String, enum: ['New', 'Hot', 'Sale', 'Best Seller', ''], default: '' },
  promoText: { type: String, default: '' },
  discountPercent: { type: Number, default: 0 },
  category: {
    type: String,
    required: true,
    default: 'General',
  },

  id: { type: String },
  image: { type: String, default: '' },
  images: [String],
  variations: [variationSchema],
  specifications: [{ label: String, value: String }],
  stock: { type: Number, default: 0 },
  costPerItem: { type: Number, default: 0 },
  barcode: { type: String, default: '' },
  vendor: { type: String, default: '' },
  productType: { type: String, default: '' },
  trackQuantity: { type: Boolean, default: true },
  continueSellingOutOfStock: { type: Boolean, default: false },
  weight: { type: Number, default: 0 },
  weightUnit: { type: String, default: 'kg' },
  chargeTax: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: true },
  // Publish state as shown in the admin. `isPublished` stays in sync with it
  // (see the pre-save hook) because the storefront filters on that flag.
  status: {
    type: String,
    enum: ['active', 'draft', 'archived'],
    default: 'active',
  },
  isFeatured: { type: Boolean, default: false },
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  tags: [String],
  specBullets: [String],
  feature1Title: String,
  feature1Sub: String,
  feature1Desc: String,
  feature1Desc2: String,
  feature1Img: String,
  feature2Title: String,
  feature2Sub: String,
  feature2Desc: String,
  feature2Desc2: String,
  feature2Img: String,
  feature3Title: String,
  feature3Sub: String,
  feature3Desc: String,
  feature3Desc2: String,
  feature3Img: String,
  accordionItems: [{ title: String, content: String }],
  colors: [String],
  colorLabel: String,
}, { timestamps: true });

// Auto-generate slug from name
productSchema.pre('save', async function (this: any) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

// Keep the publish flag the storefront queries on in step with `status`.
productSchema.pre('save', function (this: any) {
  if (this.isModified('status')) {
    this.isPublished = this.status === 'active';
  }
});

productSchema.methods.updateRating = function (this: any) {
  if (this.reviews.length === 0) { this.rating = 0; this.numReviews = 0; return; }
  const avg = this.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / this.reviews.length;
  this.rating = Math.round(avg * 10) / 10;
  this.numReviews = this.reviews.length;
};

export default mongoose.models.Product || mongoose.model('Product', productSchema);
