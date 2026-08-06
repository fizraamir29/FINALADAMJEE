export interface Product {
  id: string;
  _id?: string;
  name: string;
  code: string;
  price: number;
  comparePrice?: number;
  costPerItem?: number;
  barcode?: string;
  vendor?: string;
  productType?: string;
  trackQuantity?: boolean;
  continueSellingOutOfStock?: boolean;
  weight?: number;
  weightUnit?: string;
  chargeTax?: boolean;
  rating: number;
  image: string;
  images?: string[];
  tag?: string;
  promoText?: string;
  discountPercent?: number;
  category?: string;
  brand?: string;
  specs?: any;
  additionalImages?: string[];
  description?: string;
  stock?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  slug?: string;
  specBullets?: string[];
  feature1Title?: string;
  feature1Sub?: string;
  feature1Desc?: string;
  feature1Desc2?: string;
  feature1Img?: string;
  feature2Title?: string;
  feature2Sub?: string;
  feature2Desc?: string;
  feature2Desc2?: string;
  feature2Img?: string;
  feature3Title?: string;
  feature3Sub?: string;
  feature3Desc?: string;
  feature3Desc2?: string;
  feature3Img?: string;
  accordionItems?: { title: string; content: string }[];
  colors?: string[];
  colorLabel?: string;
}

export interface PCComponent {
  id: string;
  type: string;
  name: string;
  price: number;
  watts: number;
}

export interface GameMetrics {
  name: string;
  cpuScale: number;
  gpuScale: number;
  baseFps: number;
}

export interface Testimonial {
  name: string;
  text: string;
  verified: boolean;
  image?: string;
  videoUrl?: string;
  isCustomSubmit?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  image: string;
  tag: string;
  date: string;
  desc: string;
}
