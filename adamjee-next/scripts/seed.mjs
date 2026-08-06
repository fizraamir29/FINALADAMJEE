// ─── Adamjee Computers — Database Seed Script ─────────────────────────────
// Reads products from src/data.ts and pushes them all to MongoDB Atlas
// Usage: node scripts/seed.mjs
// ──────────────────────────────────────────────────────────────────────────
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dns from 'dns';

// Force IPv4 first and use public DNS servers to resolve MongoDB SRV records reliably
try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  console.warn('⚠️ Could not set custom DNS servers:', e);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env file!');
  process.exit(1);
}

// ── Product Schema (matches the app's model) ─────────────────────────────
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String },
  code: { type: String },
  price: { type: Number, required: true },
  costPerItem: { type: Number, default: 0 },
  rating: { type: Number, default: 5 },
  images: [{ type: String }],
  image: { type: String },
  category: { type: String },
  tag: { type: String },
  description: { type: String, default: '' },
  isPublished: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  stock: { type: Number, default: 50 },
  vendor: { type: String, default: 'Adamjee Computers' },
  productType: { type: String, default: '' },
  trackQuantity: { type: Boolean, default: true },
  continueSellingOutOfStock: { type: Boolean, default: false },
  weight: { type: Number, default: 1 },
  weightUnit: { type: String, default: 'kg' },
  chargeTax: { type: Boolean, default: true },
  barcode: { type: String, default: '' },
  reviews: { type: Array, default: [] },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// ── All Products Data ─────────────────────────────────────────────────────
const ALL_PRODUCTS = [
  { id:"na1", name:'Dell UltraSharp 29" UltraWide LED Monitor', code:'Code u2917w', price:500, rating:5, image:'/images/dell_led_monitor_1780238004077.png', category:'Accessories', tag:'New', description:'The Dell UltraSharp U2917W is a 29-inch UltraWide IPS monitor.' },
  { id:"na2", name:'Aftershock Oden Mechanical Gaming Keyboard', code:'Code asmkb87-2020', price:500, rating:5, image:'/images/mechanical_keyboard_1780238028029.png', category:'Accessories', tag:'Hot', description:'The Aftershock Oden is a tenkeyless mechanical gaming keyboard built with Cherry MX switches.' },
  { id:"na3", name:'ASUS RTX 4080 Gaming Graphics Card', code:'Code RTX-4080-ASUS', price:999, rating:5, image:'/images/rtx_graphics_card_1780238052630.png', category:'Accessories', tag:'New', description:'The ASUS RTX 4080 delivers next-generation Ada Lovelace performance with 16GB GDDR6X.' },
  { id:"na4", name:'AMD Ryzen 9 7900X3D Processor', code:'Code AMD-R9-7900X3D', price:549, rating:5, image:'/images/ryzen_processor_box_1780238074653.png', category:'Accessories', tag:'Hot', description:'The AMD Ryzen 9 7900X3D combines 12 Zen 4 cores with AMD 3D V-Cache technology.' },
  { id:"na5", name:'Corsair Vengeance RGB 32GB DDR5 RAM', code:'Code CMH32GX5M2', price:125, rating:5, image:'/images/corsair_rgb_ram_1780238095594.png', category:'Accessories', tag:'New', description:'Corsair Vengeance RGB DDR5-6000MHz 32GB dual-channel kit with XMP 3.0 and EXPO support.' },
  { id:"na6", name:'Logitech G Pro X Superlight 2 Gaming Mouse', code:'Code 910-006633', price:160, rating:5, image:'/images/logitechgprox_gaming_mouse_1780238118118.png', category:'Accessories', tag:'New', description:'The Logitech G Pro X Superlight 2 is an ultra-lightweight wireless gaming mouse.' },
  { id:"hp1", name:'Custom RGB Gaming PC — Phantom Build', code:'AJ-PHANTOM-01', price:1800, rating:4.9, image:'/images/custom_black_gaming_pc_cases_1780241958741.png', category:'Desktops', tag:'Hot', isFeatured:true, description:'The Adamjee Phantom Build is our flagship custom gaming PC, crafted for elite gamers.' },
  { id:"hp2", name:'Custom RGB Gaming PC — Aurora Build', code:'AJ-AURORA-02', price:1200, rating:4.7, image:'/images/custom_blue_gaming_pc_cases_1780242165601.png', category:'Desktops', tag:'New', isFeatured:true, description:'The Aurora Build combines stunning aesthetics with mid-tier performance.' },
  { id:"hp3", name:'Custom RGB Gaming PC — Titan Build', code:'AJ-TITAN-03', price:2400, rating:5.0, image:'/images/custom_white_gaming_pc_case_1780242072088.png', category:'Desktops', tag:'Hot', isFeatured:true, description:'The Titan Build is our most powerful and exclusive custom gaming rig.' },
  { id:"hp4", name:'Custom RGB Gaming PC — Inferno Build', code:'AJ-INFERNO-04', price:950, rating:4.5, image:'/images/custom_black_gaming_pc_cases_1780241958741.png', category:'Desktops', tag:'Sale', isFeatured:true, description:'Perfect entry-level gaming PC for competitive esports gamers.' },
  { id:"hp5", name:'Custom RGB Gaming PC — Nova Build', code:'AJ-NOVA-05', price:1550, rating:4.8, image:'/images/custom_blue_gaming_pc_cases_1780242165601.png', category:'Desktops', tag:'New', isFeatured:true, description:'The Nova Build is tuned for streaming, content creation, and gaming simultaneously.' },
  { id:"hp6", name:'Custom RGB Gaming PC — Eclipse Build', code:'AJ-ECLIPSE-06', price:3200, rating:5.0, image:'/images/custom_white_gaming_pc_case_1780242072088.png', category:'Desktops', tag:'Hot', isFeatured:true, description:'The Eclipse is our limited-edition ultra-premium flagship gaming system.' },
  { id:"ac1", name:'Sony WH-1000XM5 Noise-Cancelling Headphones', code:'Code WH1000XM5', price:350, rating:4.9, image:'/images/sony_headphones_1780238143215.png', category:'Headphones', tag:'Hot', description:'The Sony WH-1000XM5 features 8 microphones, HD Noise Cancelling Processor, and 30-hour battery.' },
  { id:"ac2", name:'Apple AirPods Max — Over-Ear Headphones', code:'Code MGYN3LL/A', price:549, rating:4.8, image:'/images/apple_airpods_max_1780238166073.png', category:'Headphones', tag:'New', description:'AirPods Max features computational audio, Adaptive EQ, and Active Noise Cancellation.' },
  { id:"ac3", name:'Jabra Evolve2 85 Business Headset', code:'Code 29385-999-999', price:449, rating:4.6, image:'/images/jabra_evolve_headphones_1780238188777.png', category:'Headphones', tag:'New', description:'Jabra Evolve2 85 — world-class speakers designed for professional use.' },
  { id:"ac4", name:'Shure SE846 Pro Sound-Isolating Earphones', code:'Code SE846-CL', price:899, rating:4.9, image:'/images/shure_earphones_1780238211474.png', category:'Earphones', tag:'Hot', description:'SE846 features a quad high-definition MicroDriver system and replaceable cables.' },
  { id:"ac5", name:'Samsung Galaxy Buds Pro 2', code:'Code SM-R510NZAAXAR', price:200, rating:4.7, image:'/images/samsung_galaxy_buds_1780238233879.png', category:'Earphones', tag:'New', description:'Galaxy Buds Pro 2 features Intelligent ANC, 360 Audio, and up to 29 hours of playtime.' },
  { id:"ac6", name:'Beats Studio Buds+ True Wireless Earbuds', code:'Code MUWY3LL/A', price:170, rating:4.5, image:'/images/beats_earphones_1780238255981.png', category:'Earphones', tag:'Sale', description:'Studio Buds+ with Active Noise Cancelling, Transparency Mode, and up to 36 hours.' },
  { id:"sp1", name:'Sonos Era 300 Spatial Audio Speaker', code:'Code E30G1US1', price:449, rating:4.9, image:'/images/sonos_speakers_1780238279012.png', category:'Speakers', tag:'Hot', description:'Sonos Era 300 is the first Sonos speaker designed for spatial audio with Dolby Atmos.' },
  { id:"sp2", name:'JBL Charge 5 Portable Bluetooth Speaker', code:'Code JBLCHARGE5BLKAM', price:180, rating:4.7, image:'/images/jbl_speakers_1780238302282.png', category:'Speakers', tag:'New', description:'JBL Charge 5 delivers powerful JBL Pro Sound with deep bass and 20 hours of play.' },
  { id:"sp3", name:'Bose SoundLink Max Portable Speaker', code:'Code 884964-0100', price:399, rating:4.8, image:'/images/bose_speaker_1780238323829.png', category:'Speakers', tag:'Hot', description:'SoundLink Max delivers legendary Bose sound in a rugged, portable design.' },
  { id:"b1", name:'Ultimate Gaming Bundle — Starter Pack', code:'AJ-BUNDLE-STARTER', price:750, rating:4.8, image:'/images/gaming_bundle_1780242394561.png', category:'Accessories', tag:'Bundle', description:'Everything you need to start your gaming journey — keyboard, mouse, headset, and mousepad.' },
  { id:"b2", name:'Pro Streaming Bundle — Content Creator Pack', code:'AJ-BUNDLE-STREAM', price:1200, rating:4.9, image:'/images/gaming_bundle_1780242394561.png', category:'Accessories', tag:'Bundle', description:'Complete streaming setup including microphone, lighting, and capture card.' },
  { id:"b3", name:'RGB Peripherals Bundle — Full Desk Setup', code:'AJ-BUNDLE-RGB', price:599, rating:4.7, image:'/images/gaming_bundle_1780242394561.png', category:'Accessories', tag:'Bundle', description:'Full RGB desk setup with keyboard, mouse, mousepad, and monitor light.' },
];

function makeSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function seed() {
  console.log('🔌 Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('✅ Connected!');

  // Count existing
  const existing = await Product.countDocuments();
  console.log(`📦 Existing products in DB: ${existing}`);

  if (existing > 0) {
    console.log('⚠️  Products already exist. Clearing and re-seeding...');
    await Product.deleteMany({});
  }

  const docs = ALL_PRODUCTS.map(p => ({
    name: p.name,
    slug: makeSlug(p.name),
    code: p.code || '',
    price: p.price,
    costPerItem: Math.round(p.price * 0.6),
    rating: p.rating || 5,
    images: [p.image, ...(p.additionalImages || [])].filter(Boolean),
    image: p.image,
    category: p.category,
    tag: p.tag || '',
    description: p.description || '',
    isPublished: true,
    isFeatured: p.isFeatured || false,
    stock: 50,
    vendor: 'Adamjee Computers',
    productType: p.category,
    trackQuantity: true,
    weight: 1,
    weightUnit: 'kg',
    chargeTax: true,
    barcode: '',
    reviews: [],
  }));

  const result = await Product.insertMany(docs);
  console.log(`✅ Successfully seeded ${result.length} products into MongoDB Atlas!`);
  
  const inserted = await Product.find({}, 'name price category').lean();
  console.log('\n📋 Products in Database:');
  inserted.forEach((p, i) => console.log(`  ${i+1}. [${p.category}] ${p.name} — $${p.price}`));

  await mongoose.disconnect();
  console.log('\n🎉 Seed complete! Your Vercel site will now show all products.');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
