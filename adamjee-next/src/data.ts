import { Product, PCComponent, GameMetrics } from "./types";

export const CURRENCIES = {
  USD: { symbol: "Rs. ", rate: 1, name: "Pakistan (Rs. PKR)" },
  PKR: { symbol: "Rs. ", rate: 1, name: "Pakistan (Rs. PKR)" }
};

export const NEW_ARRIVALS: Product[] = [
  {
    id: "na1",
    name: "Dell UltraSharp 29\" UltraWide LED Monitor",
    code: "Code u2917w",
    price: 500.00,
    rating: 5.0,
    image: "/images/dell_led_monitor_1780238004077.png",
    category: "Monitors",
    tag: "New",
    description: "The Dell UltraSharp U2917W is a 29-inch UltraWide IPS monitor designed to enhance productivity and streamline multitasking. With its 21:9 aspect ratio and 2560×1080 resolution, it offers significantly more horizontal screen space.",
    additionalImages: [
      "/images/dell_led_monitor_1780238004077.png",
      "/images/rog_monitor_new.png"
    ],
    specBullets: [
      "Screen size: 29-inch UltraWide (2560×1080 resolution)",
      "Panel type: IPS with professional color calibration (Delta-E < 2)",
      "Aspect Ratio: 21:9 for expansive multitasking productivity",
      "Stand: Fully adjustable (height, tilt, swivel, pivot)",
      "Ports: 1× DisplayPort, 1× Mini-DP, 2× HDMI, 4× USB 3.0",
      "Colors: sRGB 99% coverage for precise design workflows"
    ],
    feature1Title: "Premium UltraWide Productivity",
    feature1Sub: "Expansive 21:9 UltraWide Display for Productivity",
    feature1Desc: "The Dell UltraSharp U2917W is a 29-inch UltraWide IPS monitor designed to enhance productivity and streamline multitasking. With its 21:9 aspect ratio and 2560×1080 resolution, it offers significantly more horizontal screen space.",
    feature1Desc2: "It features professional color calibration right out of the box (Delta-E <2) so all design work displays perfectly with ultra-wide viewing angles.",
    feature1Img: "/images/dell_led_monitor_1780238004077.png",
    feature2Title: "Ergonomic and Professional Design",
    feature2Sub: "Built for Ultimate Comfort",
    feature2Desc: "Adjust height, tilt, swivel and pivot to your exact comfort preference. The screen border is thin, making it perfect for multi-display setups.",
    feature2Desc2: "An integrated cable management slot in the stand guides cables neatly to keep your desktop workspace clutter-free.",
    feature2Img: "/images/rog_monitor_new.png",
    accordionItems: [
      { title: "Display Specifications", content: "29\" UltraWide LED, 2560x1080 resolution, 21:9 aspect ratio, 60Hz refresh rate, 5ms response time, IPS panel, sRGB 99% coverage." },
      { title: "Connectivity & Ports", content: "1x DisplayPort 1.2, 1x Mini-DisplayPort, 1x DisplayPort-out (MST), 2x HDMI 1.4, 4x USB 3.0 downstream ports, 1x USB 3.0 upstream port." },
      { title: "Dimensions & Ergonomics", content: "Adjustable height up to 130mm, tilt (-5° to 21°), swivel (-30° to 30°), pivot (90° clockwise). VESA mountable 100x100mm." }
    ],
    colors: ["Black", "Midnight Blue"],
    colorLabel: "Frame Color"
  },
  {
    id: "na2",
    name: "Aftershock Oden Mechanical Gaming Keyboard",
    code: "Code asmkb87-2020",
    price: 500.00,
    rating: 5.0,
    image: "/images/mechanical_keyboard_1780238028029.png",
    category: "Keyboards",
    tag: "Hot",
    description: "The Aftershock Oden is a tenkeyless mechanical gaming keyboard built with Cherry MX switches. Featuring per-key RGB, N-key rollover, and a premium aluminium top plate.",
    additionalImages: [
      "/images/mechanical_keyboard_1780238028029.png",
      "/images/mechanical_keyboard_1780238028029.png",
      "/images/mechanical_keyboard_1780238028029.png"
    ],
    specBullets: [
      "Switches: Cherry MX Mechanical Switches",
      "Form Factor: Compact Tenkeyless Layout (87 keys)",
      "Backlighting: Per-key fully customizable RGB",
      "Build: Premium anodized aluminium top plate",
      "Rollover: N-key rollover with 100% anti-ghosting",
      "Connectivity: Detachable USB-C braided cable"
    ],
    feature1Title: "Cherry MX Mechanical Switches",
    feature1Sub: "Ultra-Tactile and Responsive Performance",
    feature1Desc: "The Aftershock Oden features gold-crosspoint contact Cherry MX switches, delivering the ultimate key response and tactical feedback. Rated for over 50 million keystrokes for reliable durability.",
    feature1Desc2: "Detachable high-speed USB-C braided cable provides low-latency connectivity and makes the keyboard highly portable for travel.",
    feature1Img: "/images/mechanical_keyboard_1780238028029.png",
    feature2Title: "Premium Anodized Aluminium Plate",
    feature2Sub: "Heavy-Duty Construction",
    feature2Desc: "Crafted with an aerospace-grade anodized aluminium top plate, the keyboard offers a rigid, non-slip frame built to withstand intense gaming sessions.",
    feature2Desc2: "Per-key dynamic RGB backlighting can be customized via software, offering 16.8 million colors and reactive animations.",
    feature2Img: "/images/mechanical_keyboard_1780238028029.png",
    accordionItems: [
      { title: "Switch Specifications", content: "Cherry MX Mechanical Switches, 2.0mm actuation distance, 4.0mm total travel, 45g actuation force, tactile bump/click feedback." },
      { title: "Keycaps & Layout", content: "Compact Tenkeyless (TKL) 87-key layout, double-shot injection PBT keycaps, standard bottom row, wear-resistant legends." },
      { title: "Dimensions & Package", content: "Dimensions: 360 x 140 x 38mm. Package includes: Oden Keyboard, Braided USB-C Cable, Keycap Puller, User Manual." }
    ],
    colors: ["Eclipse Black", "Snow White"],
    colorLabel: "Keycap Set"
  },
  {
    id: "na3",
    name: "ASUS RTX 4080 Gaming Graphics Card",
    code: "Code RTX-4080-ASUS",
    price: 999.00,
    rating: 5.0,
    image: "/images/rtx_graphics_card_1780238052630.png",
    category: "Accessories",
    tag: "New",
    description: "The ASUS RTX 4080 delivers next-generation Ada Lovelace performance with 16GB GDDR6X VRAM, real-time ray tracing, and DLSS 3.5 frame generation for the ultimate 4K gaming experience.",
    additionalImages: [
      "/images/rtx_graphics_card_1780238052630.png",
      "/images/rtx_graphics_card_1780238052630.png"
    ]
  },
  {
    id: "na4",
    name: "AMD Ryzen 9 7900X3D Processor",
    code: "Code AMD-R9-7900X3D",
    price: 549.00,
    rating: 5.0,
    image: "/images/ryzen_processor_box_1780238074653.png",
    category: "Accessories",
    tag: "Hot",
    description: "The AMD Ryzen 9 7900X3D combines 12 Zen 4 cores with AMD 3D V-Cache technology, delivering unprecedented gaming and multithreaded performance on the AM5 platform.",
    additionalImages: [
      "/images/ryzen_processor_box_1780238074653.png",
      "/images/ryzen_processor_box_1780238074653.png"
    ]
  },
  {
    id: "na5",
    name: "Corsair Vengeance RGB 32GB DDR5 RAM",
    code: "Code CMH32GX5M2",
    price: 125.00,
    rating: 5.0,
    image: "/images/corsair_rgb_ram_1780238095594.png",
    category: "Accessories",
    tag: "New",
    description: "Corsair Vengeance RGB DDR5-6000MHz 32GB dual-channel kit with XMP 3.0 and EXPO support. Individual per-stick iCUE RGB lighting with low-profile 44mm aluminium heatspreader.",
    additionalImages: [
      "/images/corsair_rgb_ram_1780238095594.png"
    ]
  },
  {
    id: "na6",
    name: "GameSir T4 Cyclone Pro Controller",
    code: "Code GAMESIR-T4-PRO",
    price: 59.00,
    rating: 5.0,
    image: "/images/gamesir_controller_1780238117003.png",
    category: "Accessories",
    tag: "Hot",
    description: "The GameSir T4 Cyclone Pro features Hall-effect joystick sensors for zero drift, 2.4GHz ultra-low latency wireless, and universal compatibility across PC, Android, iOS, and Nintendo Switch.",
    additionalImages: [
      "/images/gamesir_controller_1780238117003.png",
      "/images/gamesir_controller_1780238117003.png",
      "/images/gamesir_controller_1780238117003.png"
    ]
  }
];

export const BUNDLE_PRODUCTS: Product[] = [
  {
    id: "bp1",
    name: "Glowing RGB Wired Gaming Mouse",
    code: "Code MS-RGB-GLOW",
    price: 500.00,
    rating: 5.0,
    image: "/images/gaming_mouse_rgb_new.png"
  },
  {
    id: "bp2",
    name: "Premium Ergonomic Blue Gaming Chair",
    code: "Code CH-ERGO-BLUE",
    price: 500.00,
    rating: 5.0,
    image: "/images/gaming_chair_blue_1780246513295.png",
    tag: "Hot"
  },
  {
    id: "bp3",
    name: "ASUS ROG Red & Black Headset",
    code: "Code HP-ROG-RED",
    price: 500.00,
    rating: 5.0,
    image: "/images/headphones_red_black_1780246535746.png",
    tag: "Hot"
  },
  {
    id: "bp4",
    name: "ASUS ROG Swift Gaming Monitor",
    code: "Code MON-ROG360",
    price: 500.00,
    rating: 5.0,
    image: "/images/rog_monitor_new.png"
  }
];

export const PROCESSORS: PCComponent[] = [
  { id: "cpu1", type: "Processor", name: "AMD Ryzen 7 7800X3D (Extreme Gaming)", price: 419, watts: 120 },
  { id: "cpu2", type: "Processor", name: "Intel Core i9-14900KS (Ultimate Performance)", price: 589, watts: 150 },
  { id: "cpu3", type: "Processor", name: "AMD Ryzen 5 7600X (Budget King)", price: 199, watts: 105 },
  { id: "cpu4", type: "Processor", name: "Intel Core i7-14700K (Content Creation)", price: 389, watts: 125 }
];

export const GPUS: PCComponent[] = [
  { id: "gpu1", type: "Graphics Card", name: "NVIDIA RTX 4095 Extreme (24GB VRAM)", price: 1690, watts: 450 },
  { id: "gpu2", type: "Graphics Card", name: "NVIDIA RTX 4080 Super (16GB VRAM)", price: 999, watts: 320 },
  { id: "gpu3", type: "Graphics Card", name: "AMD Radeon RX 7800 XT (16GB GDDR6)", price: 499, watts: 263 },
  { id: "gpu4", type: "Graphics Card", name: "NVIDIA RTX 4070 Ti Super (12GB VRAM)", price: 799, watts: 285 }
];

export const MOTHERBOARDS: PCComponent[] = [
  { id: "mob1", type: "Motherboard", name: "ASUS ROG Strix Z790-E WiFi", price: 399, watts: 65 },
  { id: "mob2", type: "Motherboard", name: "MSI MAG B650 Tomahawk WiFi", price: 219, watts: 50 },
  { id: "mob3", type: "Motherboard", name: "ASRock X670E Taichi Carrara", price: 499, watts: 75 }
];

export const MEMORIES: PCComponent[] = [
  { id: "ram1", type: "RAM Memory", name: "32GB (2x16GB) Corsair Vengeance DDR5 6000MHz", price: 125, watts: 12 },
  { id: "ram2", type: "RAM Memory", name: "64GB (2x32GB) G.Skill Trident Z5 RGB 6400MHz", price: 245, watts: 18 },
  { id: "ram3", type: "RAM Memory", name: "16GB (2x8GB) Kingston Fury Beast 5200MHz", price: 69, watts: 8 }
];

export const STORAGES: PCComponent[] = [
  { id: "ssd1", type: "SSD Storage", name: "2TB Samsung 990 Pro M.2 NVMe PCIe 4.0", price: 185, watts: 7 },
  { id: "ssd2", type: "SSD Storage", name: "4TB Crucial T700 Gen5 NVMe (Extreme Speed)", price: 360, watts: 11 },
  { id: "ssd3", type: "SSD Storage", name: "1TB Kingston NV2 PCIe NVMe SSD", price: 65, watts: 5 }
];

export const PSUS: PCComponent[] = [
  { id: "psu1", type: "Power Supply", name: "Corsair RM1000x 1000W 80+ Gold Modular", price: 189, watts: 0 },
  { id: "psu2", type: "Power Supply", name: "MSI MAG A850GL 850W PCIe 5 Gold", price: 129, watts: 0 },
  { id: "psu3", type: "Power Supply", name: "EVGA SuperNOVA 1600W T2 Titanium", price: 399, watts: 0 }
];

export const COOLS: PCComponent[] = [
  { id: "col1", type: "CPU Cooler", name: "ROG Ryujin III 360 ARGB Liquid Cooler", price: 329, watts: 38 },
  { id: "col2", type: "CPU Cooler", name: "LIAN LI Galahad II Trinity 360 AIO", price: 169, watts: 30 },
  { id: "col3", type: "CPU Cooler", name: "Noctua NH-D15 chromax.black Dual-Tower", price: 119, watts: 12 }
];

export const CASES: PCComponent[] = [
  { id: "cas1", type: "PC Cabinet", name: "Lian Li O11 Dynamic EVO (Panoramic Glass)", price: 169, watts: 0 },
  { id: "cas2", type: "PC Cabinet", name: "NZXT H9 Flow High Airflow Chassis", price: 159, watts: 0 },
  { id: "cas3", type: "PC Cabinet", name: "Montech KING 95 Pro Panoramic RGB Blue", price: 129, watts: 0 }
];

export const ADD_ON_COMPONENTS = [
  { type: "Case Fans", name: "3x Corsair QX120 RGB Magnetic Fans", price: 119, watts: 15 },
  { type: "Sleeved Cables", name: "Lian Li Strimer Plus V2 RGB Cable Set", price: 69, watts: 5 },
  { type: "Custom Lighting", name: "Razer Chroma Light Strip Expansion", price: 49, watts: 8 },
  { type: "Sound Card", name: "Creative Sound BlasterX AE-5 Plus", price: 149, watts: 10 },
  { type: "WiFi Card", name: "Intel Killer WiFi 7 BE1750 PCIe Card", price: 59, watts: 4 }
];

export const TARGET_GAMES: GameMetrics[] = [
  { name: "Cyberpunk 2077 (Ray-Tracing Overdrive)", cpuScale: 1.1, gpuScale: 1.8, baseFps: 55 },
  { name: "GTA V / FiveM Roleplay Servers", cpuScale: 1.4, gpuScale: 1.1, baseFps: 120 },
  { name: "Counter-Strike 2 (Esports Competitive)", cpuScale: 2.1, gpuScale: 0.9, baseFps: 290 },
  { name: "Valorant (Competitive Settings)", cpuScale: 2.4, gpuScale: 0.7, baseFps: 380 },
  { name: "Call of Duty: Warzone 3.0 (Battle Royale)", cpuScale: 1.5, gpuScale: 1.4, baseFps: 105 }
];

