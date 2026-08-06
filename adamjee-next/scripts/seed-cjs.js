// Simple CJS seed script — runs with: node scripts/seed-cjs.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']); // Use Google/Cloudflare DNS to bypass ISP DNS issue
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
console.log('URI found:', MONGO_URI ? 'YES ✅' : 'NO ❌');

const ProductSchema = new mongoose.Schema({
  name: String, slug: String, code: String, price: Number,
  costPerItem: Number, rating: Number, images: [String], image: String,
  category: String, tag: String, description: String,
  isPublished: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  stock: Number, vendor: String, productType: String,
  trackQuantity: Boolean, continueSellingOutOfStock: Boolean,
  weight: Number, weightUnit: String, chargeTax: Boolean,
  barcode: String, reviews: Array,
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

function makeSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const PRODUCTS = [
  { name:'Dell UltraSharp 29" UltraWide LED Monitor', code:'u2917w', price:500, rating:5, image:'/images/dell_led_monitor_1780238004077.png', category:'Accessories', tag:'New', description:'The Dell UltraSharp U2917W is a 29-inch UltraWide IPS monitor.' },
  { name:'Aftershock Oden Mechanical Gaming Keyboard', code:'asmkb87-2020', price:500, rating:5, image:'/images/mechanical_keyboard_1780238028029.png', category:'Accessories', tag:'Hot', description:'Tenkeyless mechanical gaming keyboard with Cherry MX switches.' },
  { name:'ASUS RTX 4080 Gaming Graphics Card', code:'RTX-4080-ASUS', price:999, rating:5, image:'/images/rtx_graphics_card_1780238052630.png', category:'Accessories', tag:'New', description:'Next-gen Ada Lovelace performance with 16GB GDDR6X VRAM.' },
  { name:'AMD Ryzen 9 7900X3D Processor', code:'AMD-R9-7900X3D', price:549, rating:5, image:'/images/ryzen_processor_box_1780238074653.png', category:'Accessories', tag:'Hot', description:'12 Zen 4 cores with AMD 3D V-Cache technology.' },
  { name:'Corsair Vengeance RGB 32GB DDR5 RAM', code:'CMH32GX5M2', price:125, rating:5, image:'/images/corsair_rgb_ram_1780238095594.png', category:'Accessories', tag:'New', description:'DDR5-6000MHz 32GB dual-channel kit with XMP 3.0 and EXPO support.' },
  { name:'Logitech G Pro X Superlight 2 Gaming Mouse', code:'910-006633', price:160, rating:5, image:'/images/logitechgprox_gaming_mouse_1780238118118.png', category:'Accessories', tag:'New', description:'Ultra-lightweight wireless gaming mouse at 60g.' },
  { name:'Custom RGB Gaming PC — Phantom Build', code:'AJ-PHANTOM-01', price:1800, rating:4.9, image:'/images/custom_black_gaming_pc_cases_1780241958741.png', category:'Desktops', tag:'Hot', isFeatured:true, description:'Flagship custom gaming PC crafted for elite gamers.' },
  { name:'Custom RGB Gaming PC — Aurora Build', code:'AJ-AURORA-02', price:1200, rating:4.7, image:'/images/custom_blue_gaming_pc_cases_1780242165601.png', category:'Desktops', tag:'New', isFeatured:true, description:'Stunning aesthetics with mid-tier performance.' },
  { name:'Custom RGB Gaming PC — Titan Build', code:'AJ-TITAN-03', price:2400, rating:5.0, image:'/images/custom_white_gaming_pc_case_1780242072088.png', category:'Desktops', tag:'Hot', isFeatured:true, description:'Most powerful and exclusive custom gaming rig.' },
  { name:'Custom RGB Gaming PC — Inferno Build', code:'AJ-INFERNO-04', price:950, rating:4.5, image:'/images/custom_black_gaming_pc_cases_1780241958741.png', category:'Desktops', tag:'Sale', isFeatured:true, description:'Entry-level gaming PC for competitive esports.' },
  { name:'Custom RGB Gaming PC — Nova Build', code:'AJ-NOVA-05', price:1550, rating:4.8, image:'/images/custom_blue_gaming_pc_cases_1780242165601.png', category:'Desktops', tag:'New', isFeatured:true, description:'Tuned for streaming, content creation, and gaming.' },
  { name:'Custom RGB Gaming PC — Eclipse Build', code:'AJ-ECLIPSE-06', price:3200, rating:5.0, image:'/images/custom_white_gaming_pc_case_1780242072088.png', category:'Desktops', tag:'Hot', isFeatured:true, description:'Limited-edition ultra-premium flagship gaming system.' },
  { name:'Sony WH-1000XM5 Noise-Cancelling Headphones', code:'WH1000XM5', price:350, rating:4.9, image:'/images/sony_headphones_1780238143215.png', category:'Headphones', tag:'Hot', description:'8 microphones, HD Noise Cancelling, 30-hour battery.' },
  { name:'Apple AirPods Max — Over-Ear Headphones', code:'MGYN3LL', price:549, rating:4.8, image:'/images/apple_airpods_max_1780238166073.png', category:'Headphones', tag:'New', description:'Computational audio, Adaptive EQ, and Active Noise Cancellation.' },
  { name:'Jabra Evolve2 85 Business Headset', code:'29385-999', price:449, rating:4.6, image:'/images/jabra_evolve_headphones_1780238188777.png', category:'Headphones', tag:'New', description:'World-class speakers designed for professional use.' },
  { name:'Shure SE846 Pro Sound-Isolating Earphones', code:'SE846-CL', price:899, rating:4.9, image:'/images/shure_earphones_1780238211474.png', category:'Earphones', tag:'Hot', description:'Quad high-definition MicroDriver system with replaceable cables.' },
  { name:'Samsung Galaxy Buds Pro 2', code:'SM-R510NZ', price:200, rating:4.7, image:'/images/samsung_galaxy_buds_1780238233879.png', category:'Earphones', tag:'New', description:'Intelligent ANC, 360 Audio, and up to 29 hours of playtime.' },
  { name:'Beats Studio Buds+ True Wireless Earbuds', code:'MUWY3LL', price:170, rating:4.5, image:'/images/beats_earphones_1780238255981.png', category:'Earphones', tag:'Sale', description:'Active Noise Cancelling, Transparency Mode, up to 36 hours.' },
  { name:'Sonos Era 300 Spatial Audio Speaker', code:'E30G1US1', price:449, rating:4.9, image:'/images/sonos_speakers_1780238279012.png', category:'Speakers', tag:'Hot', description:'First Sonos speaker designed for spatial audio with Dolby Atmos.' },
  { name:'JBL Charge 5 Portable Bluetooth Speaker', code:'JBLCHARGE5', price:180, rating:4.7, image:'/images/jbl_speakers_1780238302282.png', category:'Speakers', tag:'New', description:'Powerful JBL Pro Sound with deep bass and 20 hours of play.' },
  { name:'Bose SoundLink Max Portable Speaker', code:'884964-0100', price:399, rating:4.8, image:'/images/bose_speaker_1780238323829.png', category:'Speakers', tag:'Hot', description:'Legendary Bose sound in a rugged, portable design.' },
  { name:'Ultimate Gaming Bundle — Starter Pack', code:'AJ-BUNDLE-STARTER', price:750, rating:4.8, image:'/images/gaming_bundle_1780242394561.png', category:'Accessories', tag:'Bundle', description:'Keyboard, mouse, headset, and mousepad starter set.' },
  { name:'Pro Streaming Bundle — Content Creator Pack', code:'AJ-BUNDLE-STREAM', price:1200, rating:4.9, image:'/images/gaming_bundle_1780242394561.png', category:'Accessories', tag:'Bundle', description:'Complete streaming setup with microphone, lighting, and capture card.' },
  { name:'RGB Peripherals Bundle — Full Desk Setup', code:'AJ-BUNDLE-RGB', price:599, rating:4.7, image:'/images/gaming_bundle_1780242394561.png', category:'Accessories', tag:'Bundle', description:'Full RGB desk setup with keyboard, mouse, mousepad, and monitor light.' },
];

async function seed() {
  console.log('🔌 Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 20000, connectTimeoutMS: 20000 });
  console.log('✅ Connected to MongoDB!');

  const existing = await Product.countDocuments();
  console.log(`📦 Existing products: ${existing}`);

  if (existing > 0) {
    console.log('🧹 Clearing old products...');
    await Product.deleteMany({});
  }

  const docs = PRODUCTS.map(p => ({
    name: p.name,
    slug: makeSlug(p.name),
    code: p.code || '',
    price: p.price,
    costPerItem: Math.round(p.price * 0.6),
    rating: p.rating || 5,
    images: [p.image],
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
    continueSellingOutOfStock: false,
    weight: 1,
    weightUnit: 'kg',
    chargeTax: true,
    barcode: '',
    reviews: [],
  }));

  const result = await Product.insertMany(docs);
  console.log(`\n✅ SUCCESS! Inserted ${result.length} products into MongoDB Atlas!`);
  
  const all = await Product.find({}, 'name price category').lean();
  console.log('\n📋 Products now in Database:');
  all.forEach((p, i) => console.log(`  ${i+1}. [${p.category}] ${p.name} — $${p.price}`));

  await mongoose.disconnect();
  console.log('\n🎉 Done! Refresh your Vercel website now!');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
