import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: String, ref: 'Product', required: true },
  name: String,
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variations: [{ label: String, value: String }],
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestEmail: { type: String, default: '' },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: String,
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: String,
    country: { type: String, default: 'Pakistan' },
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'bank', 'cod'],
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 4170 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  notes: { type: String, default: '' },
  trackingNumber: { type: String, default: '' },
  paidAt: Date,
  deliveredAt: Date,
}, { timestamps: true });

orderSchema.pre('save', async function (this: any) {
  if (!this.orderId) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderId = `ORD-${String(count + 1).padStart(4, '0')}`;
  }
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
