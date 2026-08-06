import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  productId: string;
  name: string;
  rating: number;       // 1–5
  comment: string;
  isVerified: boolean;  // verified purchase
  isApproved: boolean;  // admin moderation
  helpful: number;      // helpful votes
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId:  { type: String, required: true, index: true },
    name:       { type: String, required: true, trim: true, maxlength: 60 },
    rating:     { type: Number, required: true, min: 1, max: 5 },
    comment:    { type: String, required: true, trim: true, maxlength: 1000 },
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },   // auto-approve for now
    helpful:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Prevent re-compilation in Next.js hot-reload
const Review: Model<IReview> =
  (mongoose.models.Review as Model<IReview>) ||
  mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
