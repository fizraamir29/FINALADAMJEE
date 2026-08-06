'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from "react";

import { Product } from "../types";
import { toggleWishlist, isInWishlist, getCategoryFallbackImage } from "../utils/storage";
import Testimonials from "../components/Testimonials";
import ProductReviews from "../components/ProductReviews";
import ProductCard from "../components/ProductCard";
import {
  Star, Heart, ChevronRight, ChevronLeft, Play,
  Plus, Minus, CheckCircle, Eye, ChevronDown
} from "lucide-react";

/* ─── COLOR ─────────────────────────────────────────────────────── */
const DARK = '#103256';

interface ProductListingPageProps {
  handleAddToCart: (product: Product, qty?: number) => void;
  formatPrice: (usdAmount: number) => string;
}

/* ══════════════════════════════════════════════════════════════════
   DYNAMIC CONTENT ENGINE — detects product type and returns content
══════════════════════════════════════════════════════════════════ */
type ProductType =
  | 'monitor' | 'headphone' | 'earphone' | 'speaker'
  | 'mouse' | 'keyboard' | 'chair' | 'controller'
  | 'gpu' | 'cpu' | 'ram' | 'vr' | 'laptop' | 'general';

function detectType(product: Product): ProductType {
  const n = product.name.toLowerCase();
  const c = (product.category || '').toLowerCase();
  const img = (product.image || '').toLowerCase();

  /* ── by image filename (most reliable for legacy products) ── */
  if (img.includes('monitor') || img.includes('dell_led') || img.includes('rog_monitor')) return 'monitor';
  if (img.includes('vr') || img.includes('quest')) return 'vr';
  if (img.includes('laptop')) return 'laptop';
  if (img.includes('headphone') || img.includes('headset')) return 'headphone';
  if (img.includes('earbud') || img.includes('earphone') || img.includes('tws')) return 'earphone';
  if (img.includes('speaker') || img.includes('soundbar') || img.includes('image 117') || img.includes('image 122')) return 'speaker';
  if (img.includes('mouse')) return 'mouse';
  if (img.includes('keyboard')) return 'keyboard';
  if (img.includes('chair')) return 'chair';
  if (img.includes('controller') || img.includes('gamesir')) return 'controller';
  if (img.includes('rtx') || img.includes('radeon') || img.includes('graphics')) return 'gpu';
  if (img.includes('ryzen') || img.includes('processor') || img.includes('cpu')) return 'cpu';
  if (img.includes('ram') || img.includes('corsair_rgb')) return 'ram';

  /* ── fallback: by product name ── */
  if (n.includes('monitor') || n.includes('led') || n.includes('dell') || n.includes('rog swift') || n.includes('display') || n.includes('vesa') || n.includes('ultrawide') || n.includes('360hz')) return 'monitor';
  if (n.includes('vr') || n.includes('quest') || n.includes('virtual reality')) return 'vr';
  if (n.includes('laptop')) return 'laptop';
  if (n.includes('headset') || n.includes('headphone') || c === 'headphones') return 'headphone';
  if (n.includes('earbud') || n.includes('earphone') || n.includes('tws') || n.includes('in-ear') || c === 'earphones') return 'earphone';
  if (n.includes('speaker') || n.includes('soundbar') || c === 'speakers') return 'speaker';
  if (n.includes('mouse') || n.includes('mice')) return 'mouse';
  if (n.includes('keyboard')) return 'keyboard';
  if (n.includes('chair')) return 'chair';
  if (n.includes('controller') || n.includes('gamesir') || n.includes('gamepad') || n.includes('cyclone')) return 'controller';
  if (n.includes('rtx') || n.includes('radeon') || n.includes('gpu') || n.includes('graphic') || n.includes('4080')) return 'gpu';
  if (n.includes('ryzen') || n.includes('intel') || n.includes('processor') || n.includes('cpu') || n.includes('7900x')) return 'cpu';
  if (n.includes('ram') || n.includes('ddr') || n.includes('corsair') || n.includes('vengeance')) return 'ram';
  return 'general';
}

interface DynamicContent {
  specBullets: string[];
  portsBannerImg?: string;
  feature1Title: string;
  feature1Sub: string;
  feature1Desc: string;
  feature1Desc2: string;
  feature1Img?: string;
  feature2Title: string;
  feature2Sub: string;
  feature2Desc: string;
  feature2Desc2: string;
  feature2Img: string;
  feature3Title?: string;
  feature3Sub?: string;
  feature3Desc?: string;
  feature3Desc2?: string;
  feature3Img?: string;
  accordionItems: { title: string; content: string }[];
  colorLabel: string;
  colors: string[];
}

function getDynamicContent(product: Product, type: ProductType): DynamicContent {
  switch (type) {

    case 'monitor':
      return {
        specBullets: [
          'Screen size: 32-inch (4K UHD, 3840×2160)',
          'Panel type: Fast IPS (144Hz Refresh Rate)',
          'HDR: DisplayHDR 1400 Certification',
          'Brightness: 1400 cd/m² (Peak) | Contrast: 1000:1',
          'Response time: 4ms (GtG)',
          'Ports: 1x DisplayPort 1.4, 3x HDMI 2.0, USB Hub',
        ],
        portsBannerImg: '/images/Rectangle 12598.png',
        feature1Title: 'Ergonomic and\nProfessional Design',
        feature1Sub: '',
        feature1Desc: `The ${product.name} features an ergonomic stand that offers tilt, swivel, and height adjustments. Engineered for maximum comfort during long gaming sessions or professional workflows.`,
        feature1Desc2: '',
        feature1Img: '/images/Rectangle 12629.png',
        feature2Title: 'Enjoy your favorite media\nwith premium quality audio',
        feature2Sub: '',
        feature2Desc: 'Immerse yourself in rich, high-fidelity sound. The built-in acoustic technologies deliver a wide soundstage for both gaming and entertainment.',
        feature2Desc2: '',
        feature2Img: '/images/image 105.png',
        feature3Title: 'IPS Technology for\nAccurate Colors and Clarity',
        feature3Sub: '',
        feature3Desc: 'Experience vibrant, true-to-life colors across wide viewing angles. Quantum Dot technology ensures stunning color accuracy for content creators and gamers alike.',
        feature3Desc2: '',
        feature3Img: '/images/check-img2.png',
        accordionItems: [
          { title: 'Display Features', content: '21:9 UltraWide IPS panel, 2560×1080 resolution, 75Hz refresh rate, 5ms response time, AMD FreeSync, HDR10 support, flicker-free technology, blue light filter.' },
          { title: 'Connectivity & Ports', content: '2× HDMI 2.0, 2× DisplayPort 1.4, 1× USB-A upstream, headphone jack 3.5mm. Supports daisy-chaining for multi-monitor setups.' },
          { title: 'Package Included', content: '1× Monitor, 1× Power Cable, 1× HDMI Cable, 1× DisplayPort Cable, 1× Quick Setup Guide, 1× Warranty Card.' },
          { title: 'Stand & Ergonomics', content: 'Height adjustable stand (-5° to 15° tilt). VESA 100×100mm mount compatible. Cable management routing through stand. Ultra-slim 7mm bezels on three sides.' },
        ],
        colorLabel: 'Finish',
        colors: ['Matte Black', 'Silver', 'Space Grey'],
      };

    case 'headphone':
      return {
        specBullets: [
          'Driver size: 50mm neodymium drivers',
          'Frequency response: 20Hz – 20,000Hz',
          'Impedance: 32Ω | Sensitivity: 110dB',
          'Connectivity: Wired 3.5mm + USB-A adapter',
          'Microphone: Detachable noise-cancelling boom mic',
          'Weight: 320g with plush memory foam ear cups',
        ],
        feature1Title: 'Immersive 7.1 Surround Sound',
        feature1Sub: 'Feel Every Detail',
        feature1Desc: `The ${product.name} delivers crystal-clear, directional audio with virtual 7.1 surround sound. Large 50mm neodymium drivers reproduce deep bass, rich mids, and crisp highs — hear footsteps, explosions, and ambience exactly as intended.`,
        feature1Desc2: 'Compatible with PC, PlayStation, Xbox, Nintendo Switch, and mobile devices via the included 3.5mm cable.',
        feature2Title: 'All-Day Comfort Design',
        feature2Sub: 'Built for Long Sessions',
        feature2Desc: 'Memory foam ear cushions and a padded headband distribute pressure evenly for marathon gaming sessions. The lightweight frame at just 320g prevents neck fatigue during extended use.',
        feature2Desc2: 'Swivel ear cups for easy one-ear monitoring. Retractable microphone with LED mute indicator. RGB lighting with 16.8 million color options.',
        feature2Img: '/images/headphones_red_black_1780246535746.png',
        accordionItems: [
          { title: 'Audio Features', content: 'Virtual 7.1 Surround Sound, 50mm neodymium drivers, Hi-Res Audio certified, bass boost mode, custom EQ profiles via software.' },
          { title: 'Microphone & Chat', content: 'Detachable noise-cancelling boom mic with 360° flexibility. Bi-directional polar pattern. LED mute indicator ring. Software-adjustable sidetone.' },
          { title: 'Package Included', content: '1× Gaming Headset, 1× Detachable Boom Mic, 1× USB Sound Card, 1× 3.5mm Splitter Cable, 1× User Manual, 1× Warranty Card.' },
          { title: 'Compatibility', content: 'PC (USB + 3.5mm), PlayStation 4/5 (3.5mm), Xbox One/Series X (3.5mm), Nintendo Switch, Mac, iOS, Android. Plug-and-play — no drivers required.' },
        ],
        colorLabel: 'Color',
        colors: ['Midnight Black', 'Red & Black', 'White'],
      };

    case 'earphone':
      return {
        specBullets: [
          'Driver: 10mm dynamic driver with titanium coating',
          'Frequency response: 20Hz – 20,000Hz',
          'Battery: 8h (buds) + 32h total with charging case',
          'Connectivity: Bluetooth 5.3, 10m range',
          'Water resistance: IPX5 sweat & splash proof',
          'Active Noise Cancellation (ANC) with transparency mode',
        ],
        feature1Title: 'Crystal Clear Wireless Audio',
        feature1Sub: 'Untethered Freedom',
        feature1Desc: `The ${product.name} pairs Bluetooth 5.3 with 10mm titanium-coated drivers for audiophile-quality sound without any cables. Experience deep bass, detailed mids, and sparkling highs whether you're gaming, commuting, or working.`,
        feature1Desc2: 'Instant pairing with your last connected device. Dual-device connectivity lets you switch between phone and PC seamlessly.',
        feature2Title: 'Active Noise Cancellation',
        feature2Sub: 'Focus Without Distractions',
        feature2Desc: 'Advanced ANC technology uses dual microphones to analyse and cancel ambient noise in real time. Transparency mode lets you hear your environment when needed — perfect for city commutes.',
        feature2Desc2: 'IPX5 water resistance keeps up with your active lifestyle. Ergonomic ear tips in three sizes included for a secure, comfortable fit.',
        feature2Img: '/images/tws_blue_earbuds_1780227103510.png',
        accordionItems: [
          { title: 'Audio & Sound', content: '10mm titanium dynamic drivers, aptX HD & AAC codec support, Active Noise Cancellation (ANC), Transparency Mode, custom EQ app support.' },
          { title: 'Battery & Charging', content: '8 hours playback per charge. 32 hours total with charging case. 15-minute quick charge = 2 hours playback. USB-C charging. Wireless Qi charging case.' },
          { title: 'Package Included', content: '1× True Wireless Earbuds, 1× Charging Case, 3× Ear Tip Sizes (S/M/L), 1× USB-C Cable, 1× User Manual, 1× Warranty Card.' },
          { title: 'Compatibility', content: 'Universal Bluetooth 5.3 compatibility — works with iOS, Android, Windows, Mac. Dedicated companion app for iOS & Android for EQ customization and firmware updates.' },
        ],
        colorLabel: 'Color',
        colors: ['Midnight Black', 'Pearl White', 'Ocean Blue'],
      };

    case 'speaker':
      return {
        specBullets: [
          'Total power output: 120W RMS (2.1 channel)',
          'Frequency response: 40Hz – 20,000Hz',
          'Connectivity: Bluetooth 5.0, AUX, Optical, USB',
          'Driver: 5.25" woofer + dual 2.5" satellite drivers',
          'SNR: ≥80dB | THD: <0.5% at rated power',
          'RGB lighting with 7 preset modes + app control',
        ],
        feature1Title: 'Room-Filling Immersive Sound',
        feature1Sub: '120W of Pure Audio Power',
        feature1Desc: `The ${product.name} delivers thunderous 120W RMS output through a 2.1 channel system. The dedicated 5.25-inch down-firing subwoofer produces deep, controlled bass that you feel as much as you hear — perfect for gaming, movies, and music.`,
        feature1Desc2: 'Multi-source input: Bluetooth 5.0, Optical TOSLINK, AUX 3.5mm, and USB audio. Switch sources instantly with the included remote.',
        feature2Title: 'RGB Lighting & App Control',
        feature2Sub: 'Customize Your Setup',
        feature2Desc: 'Sync RGB lighting across all three units with 7 preset animation modes or create custom patterns via the companion app. Compatible with ASUS Aura Sync, MSI Mystic Light, and Razer Chroma.',
        feature2Desc2: 'Master volume knob with headphone output on the right satellite. Easy-access bass and treble controls. Automatic standby after 30 minutes of silence.',
        feature2Img: '/images/image 117.png',
        accordionItems: [
          { title: 'Audio Features', content: '120W RMS 2.1 channel, 5.25" down-firing subwoofer, dual 2.5" tweeters, DSP-tuned frequency response, auto-standby, master volume/bass/treble controls.' },
          { title: 'Connectivity', content: 'Bluetooth 5.0 (10m range), Optical TOSLINK, 3.5mm AUX input, USB audio, 3.5mm headphone output. Multi-source switching via remote.' },
          { title: 'Package Included', content: '1× Subwoofer Unit, 2× Satellite Speakers, 1× IR Remote Control, 2× Speaker Cables, 1× USB-C Power Cable, 1× User Manual.' },
          { title: 'RGB & Software', content: 'Per-unit RGB LEDs with 7 preset modes. Free companion app (iOS & Android) for custom lighting. Compatible with Aura Sync, Mystic Light, Razer Chroma.' },
        ],
        colorLabel: 'Finish',
        colors: ['Matte Black', 'Space Grey'],
      };

    case 'mouse':
      return {
        specBullets: [
          'Sensor: PixArt PAW3395 optical sensor',
          'DPI: 100 – 26,000 DPI (5 adjustable stages)',
          'Polling rate: 125 / 250 / 500 / 1000 Hz',
          'Buttons: 6 programmable + DPI button',
          'Weight: 78g (ultra-lightweight honeycomb)',
          'Cable: 1.8m braided paracord USB-A',
        ],
        feature1Title: 'Ultra-Precise Gaming Sensor',
        feature1Sub: '26,000 DPI Zero-Acceleration',
        feature1Desc: `The ${product.name} is powered by the PixArt PAW3395 optical sensor — one of the most precise gaming sensors available. Zero acceleration, zero smoothing, zero filtering at any DPI level means your movements translate 1:1 to the screen.`,
        feature1Desc2: '1000Hz polling rate delivers 1ms response time. On-the-fly DPI switching with 5 presets via dedicated button. On-board memory stores your settings.',
        feature2Title: 'Ergonomic RGB Design',
        feature2Sub: 'Comfort for Every Grip Style',
        feature2Desc: 'Engineered for palm, claw, and fingertip grip styles with an ambidextrous shell. The honeycomb design reduces weight to just 78g without sacrificing structural rigidity — game for hours without fatigue.',
        feature2Desc2: 'PTFE feet for ultra-smooth gliding on any surface. Braided paracord cable is ultra-flexible and tangle-free. Per-zone RGB lighting with 16.8M color options.',
        feature2Img: '/images/gaming_mouse_rgb_new.png',
        accordionItems: [
          { title: 'Sensor & Performance', content: 'PixArt PAW3395 optical sensor, 26,000 DPI max, 650 IPS tracking speed, 50G acceleration, 1000Hz polling rate, zero smoothing/acceleration/filtering.' },
          { title: 'Buttons & Programming', content: '6 fully programmable buttons + scroll wheel click + DPI button. On-board memory for 5 profiles. Software-free plug-and-play with on-board profile storage.' },
          { title: 'Package Included', content: '1× Gaming Mouse, 1× USB Receiver (wireless version), 1× Braided USB Cable, 1× Extra PTFE Feet Set, 1× User Manual, 1× Warranty Card.' },
          { title: 'Software & RGB', content: 'Free companion software for macro programming, DPI calibration, and RGB customization. Compatible with Aura Sync, Mystic Light, and iCUE. On-board RGB with 7 zones.' },
        ],
        colorLabel: 'Color',
        colors: ['Matte Black', 'Phantom White', 'Red'],
      };

    case 'keyboard':
      return {
        specBullets: [
          'Switch type: Cherry MX Red (linear, 45g actuation)',
          'Layout: TKL (Tenkeyless) 87-key compact',
          'Polling rate: 1000Hz (1ms response time)',
          'Backlight: Per-key RGB with 16.8M colors',
          'Connectivity: USB-A braided cable (1.8m)',
          'N-key rollover with full anti-ghosting',
        ],
        feature1Title: 'Tactile Mechanical Precision',
        feature1Sub: 'Every Keystroke Counts',
        feature1Desc: `The ${product.name} is built with genuine Cherry MX mechanical switches — the gold standard for gaming keyboards. Linear Red switches provide smooth, consistent keystrokes with 45g actuation force and 2mm pre-travel for lightning-fast inputs.`,
        feature1Desc2: 'Full N-key rollover and 100% anti-ghosting ensures every simultaneous keypress is registered. Aircraft-grade aluminium top plate for zero flex and premium feel.',
        feature2Title: 'Per-Key RGB Customization',
        feature2Sub: '16.8 Million Colors',
        feature2Desc: 'Every key has individual RGB control with 16.8 million color options. Choose from 20+ built-in lighting effects or create your own patterns with the companion software. Syncs with your mouse, headset, and PC case lighting.',
        feature2Desc2: 'Detachable braided USB cable with gold-plated connector for stable signal. Double-shot PBT keycaps resist fading and shine even after years of use.',
        feature2Img: '/images/mechanical_keyboard_1780238028029.png',
        accordionItems: [
          { title: 'Switch & Performance', content: 'Cherry MX Red linear switches, 45g actuation, 2mm pre-travel, 4mm total travel, 50M keystroke lifespan. 1000Hz polling rate. N-key rollover + anti-ghosting.' },
          { title: 'Build & Design', content: 'Aircraft-grade aluminium top plate. Double-shot PBT keycaps. Removable USB-C/USB-A braided cable. Tenkeyless compact form factor saves 30% desk space.' },
          { title: 'Package Included', content: '1× Mechanical Keyboard, 1× Detachable Braided Cable, 1× Keycap Puller, 5× Spare Switches, 1× User Manual, 1× Warranty Card.' },
          { title: 'Software & Lighting', content: 'Free software for macro programming, per-key RGB customization, and profile management. 5 on-board profiles. Compatible with Aura Sync, Mystic Light, Razer Chroma.' },
        ],
        colorLabel: 'Switch Color',
        colors: ['Red (Linear)', 'Blue (Clicky)', 'Brown (Tactile)'],
      };

    case 'chair':
      return {
        specBullets: [
          'Material: Premium PU leather + breathable mesh back',
          'Weight capacity: 150kg / 330lbs',
          'Seat height adjustment: 42–52cm (pneumatic)',
          'Recline: 90°–155° with locking positions',
          '4D adjustable armrests (up/down/forward/rotate)',
          'Lumbar + neck support memory foam pillows',
        ],
        feature1Title: 'Engineered for All-Day Comfort',
        feature1Sub: 'Pro Gaming Ergonomics',
        feature1Desc: `The ${product.name} is designed for marathon gaming sessions. The high-density cold foam seat cushion distributes your weight evenly to eliminate pressure points. Premium PU leather stays cool and won't crack or peel.`,
        feature1Desc2: 'Patented lumbar support system follows your spine\'s natural curve. Adjustable neck pillow keeps your cervical spine aligned during long sessions.',
        feature2Title: 'Full 4D Adjustability',
        feature2Sub: 'Your Chair, Your Way',
        feature2Desc: 'Every dimension adjusts to fit your body perfectly. 4D armrests move up, down, forward, backward, and rotate inward/outward. Seat height adjusts from 42cm to 52cm with a smooth pneumatic lever.',
        feature2Desc2: '155° recline angle lets you kick back and relax. Class 4 hydraulic gas lift certified for 100,000 cycles. Heavy-duty 60mm caster wheels roll silently on hardwood and carpet.',
        feature2Img: '/images/gaming_chair_blue_1780246513295.png',
        accordionItems: [
          { title: 'Ergonomic Features', content: 'Lumbar support pillow, memory foam neck cushion, 4D adjustable armrests, 90°–155° recline with multi-position lock, seat slider (±5cm depth adjustment).' },
          { title: 'Build Quality', content: 'Steel internal frame, class 4 gas lift (150kg capacity), heavy-duty aluminium base (5-star), 60mm PU caster wheels. Cold-pressed high-density foam seat cushion.' },
          { title: 'Package Included', content: '1× Chair Back, 1× Seat, 5× Caster Wheels, 1× Armrest Set (×4), 1× Gas Lift, 1× Star Base, 2× Pillows, 1× Allen Key, 1× Assembly Guide.' },
          { title: 'Certifications & Warranty', content: 'BIFMA X5.1 certified. GREENGUARD Gold certified foam. SGS-certified gas lift. 2-year warranty on frame & mechanism, 1-year on foam & upholstery.' },
        ],
        colorLabel: 'Color',
        colors: ['Black & Blue', 'Black & Red', 'All Black', 'White'],
      };

    case 'controller':
      return {
        specBullets: [
          'Connectivity: Bluetooth 5.0 + 2.4GHz USB dongle',
          'Battery life: 20 hours on single charge',
          'Trigger: Adjustable hair-trigger with rumble motors',
          'Joystick: Hall-effect sensors (no drift)',
          'Compatibility: PC, Android, iOS, Switch, Apple TV',
          'Charging: USB-C fast charging (2h full charge)',
        ],
        feature1Title: 'Precision Hall Effect Joysticks',
        feature1Sub: 'Zero Drift, Zero Compromise',
        feature1Desc: `The ${product.name} uses Hall-effect magnetic sensors instead of traditional potentiometers — eliminating joystick drift permanently. The sensors don't wear out over time, guaranteeing precise, consistent input for the lifetime of the controller.`,
        feature1Desc2: 'Ultra-low latency 2.4GHz wireless mode delivers <5ms input lag — virtually identical to wired. Bluetooth 5.0 for mobile and casual play.',
        feature2Title: 'Universal Multi-Platform Support',
        feature2Sub: 'One Controller, Every Platform',
        feature2Desc: 'Works seamlessly with PC (Steam, Epic, Xbox Game Pass), Android, iOS, Nintendo Switch, and Apple TV via Bluetooth or USB-C. Fully customizable button mapping via the GameSir app.',
        feature2Desc2: 'Textured rubberized grip prevents slipping during intense sessions. Adjustable trigger stops for competitive FPS games. 6-axis gyroscope for motion control on compatible games.',
        feature2Img: '/images/gamesir_controller_1780238117003.png',
        accordionItems: [
          { title: 'Controls & Sensors', content: 'Hall-effect joysticks, ALPS analog triggers (0–100%), adjustable hair-trigger lock, 6-axis gyroscope, vibration motors (LB/RB + LT/RT), touchpad (model dependent).' },
          { title: 'Connectivity & Battery', content: 'Dual-mode: 2.4GHz USB dongle (<5ms lag) + Bluetooth 5.0. 1500mAh battery, 20h playtime, USB-C charging (2hrs full). Wired mode via USB-C.' },
          { title: 'Package Included', content: '1× Controller, 1× 2.4GHz USB Receiver, 1× USB-C Charging Cable, 1× User Manual, 1× Warranty Card.' },
          { title: 'App & Customization', content: 'GameSir App (iOS & Android): button remapping, dead zone adjustment, vibration intensity, firmware updates. Works with Steam Big Picture, Xbox Game Bar.' },
        ],
        colorLabel: 'Color',
        colors: ['Black', 'White', 'Midnight Blue'],
      };

    case 'gpu':
      return {
        specBullets: [
          'VRAM: 12GB GDDR6X @ 21Gbps memory speed',
          'CUDA Cores: 7680 (Ada Lovelace architecture)',
          'Base / Boost clock: 2310 MHz / 2610 MHz',
          'TDP: 285W | Requires 750W+ PSU',
          'Outputs: 3× DisplayPort 1.4a, 1× HDMI 2.1',
          'Ray Tracing + DLSS 3.5 Frame Generation',
        ],
        feature1Title: 'Next-Gen Ada Lovelace Architecture',
        feature1Sub: 'Designed to Dominate',
        feature1Desc: `The ${product.name} is built on NVIDIA's Ada Lovelace architecture with 7680 CUDA cores and 12GB of ultra-fast GDDR6X memory. Experience unmatched 4K gaming performance, real-time ray tracing, and AI-powered DLSS 3.5 frame generation.`,
        feature1Desc2: 'Triple-fan cooling system with dual BIOS switch. Zero RPM fan mode for silent operation in light workloads. GPU temperature stays below 80°C even at full load.',
        feature2Title: 'Ray Tracing & DLSS 3.5',
        feature2Sub: 'The Future of Gaming Graphics',
        feature2Desc: 'Real-time ray tracing brings photorealistic lighting, shadows, and reflections to supported games. DLSS 3.5 uses AI to reconstruct frames, boosting FPS by up to 4× with no visual quality loss.',
        feature2Desc2: 'AV1 hardware encode/decode for the fastest content creation workflows. NVIDIA Broadcast AI microphone and camera enhancement for streaming and video calls.',
        feature2Img: '/images/rtx_graphics_card_1780238052630.png',
        accordionItems: [
          { title: 'GPU Specifications', content: 'Ada Lovelace GPU, 7680 CUDA cores, 12GB GDDR6X 192-bit bus, 504 GB/s bandwidth, 2310MHz base / 2610MHz boost, 36MB L2 cache.' },
          { title: 'Cooling & Power', content: 'Triple-fan cooling with 2.9-slot design. Dual-BIOS (Performance / Silent mode). Zero RPM fan below 50°C. 285W TDP. Requires 750W+ PSU. 16-pin PCIe 5.0 connector (adapter included).' },
          { title: 'Package Included', content: '1× Graphics Card, 1× PCIe 5.0 Power Adapter (16-pin to 3× 8-pin), 1× Quick Install Guide, 1× Warranty Card.' },
          { title: 'Display & Connectivity', content: '3× DisplayPort 1.4a (HBR3), 1× HDMI 2.1 (4K 144Hz, 8K 60Hz). Supports up to 4 simultaneous displays. G-Sync Compatible + HDMI VRR.' },
        ],
        colorLabel: 'Variant',
        colors: ['OC Edition', 'Gaming X Trio', 'Founders Edition'],
      };

    case 'cpu':
      return {
        specBullets: [
          'Architecture: Zen 4 (TSMC 5nm process)',
          'Cores / Threads: 8 cores / 16 threads',
          'Base / Boost clock: 4.2 GHz / 5.0 GHz',
          'Cache: 96MB total (32MB L3 + 64MB 3D V-Cache)',
          'TDP: 120W (AM5 socket, DDR5 only)',
          'Integrated: Radeon 610M graphics',
        ],
        feature1Title: 'World\'s Fastest Gaming CPU',
        feature1Sub: 'AMD Zen 4 Architecture',
        feature1Desc: `The ${product.name} features AMD's revolutionary 3D V-Cache technology, stacking 64MB of extra L3 cache directly on the die. This dramatically reduces latency for game data, resulting in up to 15% higher gaming FPS compared to the already-exceptional standard Ryzen 7 7700X.`,
        feature1Desc2: 'Built on TSMC\'s cutting-edge 5nm process for incredible efficiency. AM5 platform brings PCIe 5.0, DDR5 memory support, and USB4 connectivity.',
        feature2Title: 'Cinematic Multitasking Power',
        feature2Sub: '8 Cores, 16 Threads',
        feature2Desc: '8 Zen 4 cores with simultaneous multi-threading handle demanding workloads with ease. Whether gaming, streaming, and recording simultaneously, or rendering 3D scenes, this processor never breaks a sweat.',
        feature2Desc2: 'Compatible with all AM5 motherboards (X670E, X670, B650E, B650). Wraith Prism RGB cooler included. Supports DDR5 up to 6000MHz (EXPO profiles).',
        feature2Img: '/images/ryzen_processor_box_1780238074653.png',
        accordionItems: [
          { title: 'Core Specifications', content: '8 cores / 16 threads, Zen 4 architecture (5nm TSMC), 4.2GHz base / 5.0GHz boost, 96MB total cache (32MB L2 + 32MB L3 + 64MB 3D V-Cache). PCIe 5.0 + 4.0.' },
          { title: 'Platform & Memory', content: 'AM5 socket (LGA 1718). DDR5-5200 official support (up to DDR5-6000 with EXPO). PCIe 5.0 ×16 for GPU. Supports USB4 40Gbps and USB 3.2 Gen2.' },
          { title: 'Package Included', content: '1× Processor, 1× Wraith Prism RGB Cooler, 1× AMD Thermal Paste, 1× Quick Start Guide, 1× Warranty Card.' },
          { title: 'Compatibility', content: 'Compatible with all AMD AM5 motherboards (X670E, X670, B650E, B650). Supports Windows 11 and Linux. Integrated Radeon 610M iGPU for basic display output.' },
        ],
        colorLabel: 'Variant',
        colors: ['Standard', '3D V-Cache', 'X Edition'],
      };

    case 'ram':
      return {
        specBullets: [
          'Capacity: 32GB (2× 16GB dual-channel kit)',
          'Speed: DDR5-6000 MHz (XMP 3.0 / EXPO ready)',
          'Latency: CL36-38-38-76 at 1.35V',
          'Form factor: UDIMM 288-pin (desktop)',
          'RGB: Individual per-stick iCUE lighting',
          'Height: 44mm — fits most CPU coolers',
        ],
        feature1Title: 'DDR5 Performance at DDR4 Prices',
        feature1Sub: '6000MHz EXPO & XMP 3.0',
        feature1Desc: `The ${product.name} runs at 6000MHz — the sweet spot for AMD Ryzen 7000 and Intel 13th/14th Gen platforms. Simply enable XMP 3.0 or EXPO in your BIOS and hit rated speeds instantly. No manual overclocking required.`,
        feature1Desc2: '32GB dual-channel capacity handles AAA gaming, content creation, video editing (4K and above), and heavy multitasking with ease. DDR5 bandwidth is 2× DDR4 for faster data throughput.',
        feature2Title: 'iCUE Dynamic RGB Lighting',
        feature2Sub: '16.8 Million Colors Per Stick',
        feature2Desc: 'Each stick features individual RGB LEDs with a translucent diffuser for smooth, even lighting. Sync with your GPU, cooler, fans, and peripherals via CORSAIR iCUE — create stunning unified lighting themes.',
        feature2Desc2: 'Low-profile 44mm height clears virtually all CPU air coolers. Aluminum heatspreader channels heat away from the ICs for stable long-term performance.',
        feature2Img: '/images/corsair_rgb_ram_1780238095594.png',
        accordionItems: [
          { title: 'Memory Specs', content: 'DDR5-6000MHz, 32GB (2×16GB), CL36-38-38-76, 1.35V, XMP 3.0 + EXPO (AMD RAMP), 288-pin UDIMM. Tested compatible with Intel 12th/13th/14th Gen and AMD Ryzen 7000.' },
          { title: 'Cooling & Build', content: 'Aluminum heatspreader with RGB diffuser. Low-profile 44mm height. ICs screened for speed and stability. Operating temperature 0°C–85°C.' },
          { title: 'Package Included', content: '2× 16GB DDR5 Memory Modules (kit), 1× Quick Installation Guide, 1× Warranty Card. iCUE software available as free download.' },
          { title: 'Software & Compatibility', content: 'CORSAIR iCUE (free download) for RGB customization and system monitoring. Compatible with ASUS AURA, MSI Mystic Light, Gigabyte RGB Fusion, ASRock Polychrome Sync.' },
        ],
        colorLabel: 'Kit Size',
        colors: ['32GB (2×16)', '64GB (2×32)', '16GB (2×8)'],
      };

    case 'vr':
      return {
        specBullets: [
          'Resolution: 2160×2160 per eye (4K total)',
          'Refresh rate: 120Hz (90Hz / 72Hz modes)',
          'Field of View: 110° horizontal FOV',
          'Tracking: 6DoF inside-out (no base stations)',
          'Controllers: Touch Pro with haptic feedback',
          'Battery: 2.5 hours VR + passthrough mode',
        ],
        feature1Title: 'Immersive 4K VR Experience',
        feature1Sub: 'See the Difference',
        feature1Desc: `The ${product.name} delivers stunning 4K resolution (2160×2160 per eye) with a 120Hz refresh rate for buttery smooth, comfortable gameplay. The Pancake lens technology reduces god rays and distortion for the clearest VR image ever seen in a consumer headset.`,
        feature1Desc2: 'Mixed Reality Passthrough lets you see and interact with your real environment without removing the headset. Perfect for productivity and social apps.',
        feature2Title: 'Inside-Out 6DoF Tracking',
        feature2Sub: 'No Base Stations Needed',
        feature2Desc: '4 wide-angle cameras track your head and controller positions with sub-millimetre accuracy — no external sensors or base stations needed. Set up your play space anywhere and start playing in minutes.',
        feature2Desc2: 'Touch Pro controllers with TruTouch haptics simulate real-world sensations. Finger-tracking capability lets you interact naturally without pressing buttons.',
        feature2Img: '/images/deal-vr.png',
        accordionItems: [
          { title: 'Display & Optics', content: '2160×2160 per eye LCD display, 120Hz (native), Pancake lens optics, 110° FOV, IPD adjustment 58–72mm, eye tracking with foveated rendering.' },
          { title: 'Tracking & Controllers', content: '6DoF inside-out tracking via 4 cameras, Touch Pro controllers with TruTouch haptics, finger tracking, pinch detection, 30-hour controller battery (AA).' },
          { title: 'Package Included', content: '1× VR Headset, 2× Touch Controllers, 1× Elite Strap, 1× USB-C Cable (3m), 2× AA Batteries, 1× Lens Cloth, 1× User Guide.' },
          { title: 'Connectivity & Compatibility', content: 'USB-C Air Link for PC VR (SteamVR, Oculus PC). Wi-Fi 6E for wireless PC streaming. Standalone Android 12-based OS. Access to Meta Quest Store (500+ titles).' },
        ],
        colorLabel: 'Storage',
        colors: ['128GB', '256GB', '512GB'],
      };

    case 'laptop':
      return {
        specBullets: [
          'Display: 15.6" FHD IPS 144Hz (300-nit, sRGB 72%)',
          'Processor: Intel Core i7-13700H (14 cores)',
          'Graphics: NVIDIA RTX 4060 8GB GDDR6',
          'Memory: 16GB DDR5-4800 (upgradeable to 64GB)',
          'Storage: 512GB NVMe PCIe 4.0 SSD (2nd slot free)',
          'Battery: 72Whr, USB-C 100W PD charging',
        ],
        feature1Title: 'Desktop-Class Gaming Performance',
        feature1Sub: 'RTX 4060 in Your Bag',
        feature1Desc: `The ${product.name} packs a full RTX 4060 laptop GPU with 8GB GDDR6 and a 14-core Intel i7-13700H into a thin 19.9mm chassis. Play demanding AAA titles at high settings with 100+ FPS at 1080p. NVIDIA DLSS 3 gives you even more frames.`,
        feature1Desc2: 'MUX Switch bypasses the iGPU for direct GPU-to-display connection, delivering up to 25% more gaming performance when plugged in.',
        feature2Title: '144Hz Display for Competitive Edge',
        feature2Sub: 'Every Frame Matters',
        feature2Desc: 'The 15.6-inch Full HD IPS display runs at 144Hz for silky-smooth motion. 3ms response time ensures no ghosting in fast-paced games. Factory colour-calibrated at Delta-E <2 for accurate creative work.',
        feature2Desc2: 'Thunderbolt 4 port for external GPU docks, 4K monitors, and ultra-fast storage. Wi-Fi 6E and Bluetooth 5.3 for wireless peripherals and fast downloads.',
        feature2Img: '/images/deal-laptop.png',
        accordionItems: [
          { title: 'Performance Specs', content: 'Intel Core i7-13700H (6P + 8E cores, 24MB cache, 5.0GHz boost), RTX 4060 8GB GDDR6 (140W TGP with Dynamic Boost), 16GB DDR5-4800 (2 slots, up to 64GB).' },
          { title: 'Display & Audio', content: '15.6" FHD IPS 144Hz, 3ms, 300-nit, 72% sRGB, anti-glare. Factory calibrated. Stereo speakers (3W ×2) with DTS:X Ultra surround. Quad-mic array with AI noise cancellation.' },
          { title: 'Package Included', content: '1× Laptop, 1× 230W AC Adapter, 1× USB-C 100W Charging Cable, 1× Quick Start Guide, 1× Warranty Card.' },
          { title: 'Ports & Connectivity', content: 'Thunderbolt 4, USB-A 3.2 ×3, HDMI 2.1, SD card reader (UHS-II), 3.5mm combo jack, RJ-45 Ethernet. Wi-Fi 6E, Bluetooth 5.3, Windows Hello IR + Fingerprint.' },
        ],
        colorLabel: 'Color',
        colors: ['Eclipse Black', 'Titanium Grey', 'Luna White'],
      };

    default:
      const bullets = (product.specBullets && product.specBullets.length > 0)
        ? product.specBullets
        : [
            `Model Code: ${product.code || 'SKU-ADAMJEE'}`,
            `Category: ${product.category || 'Gaming Hardware'}`,
            `Build Quality: Premium Grade Materials`,
            `Compatibility: Universal Plug-and-Play (Windows/macOS)`,
            `Feature: Low Latency High Response Rate`,
            `Warranty: 1 Year Adamjee Computers Official Warranty`
          ];

      return {
        specBullets: bullets,
        feature1Title: product.feature1Title || `High Performance ${product.name}`,
        feature1Sub: product.feature1Sub || 'Engineered for Enthusiasts',
        feature1Desc: product.feature1Desc || `The ${product.name} is crafted using premium-grade components and rigorous quality control. Designed for gamers, creators, and professionals who demand absolute reliability in their setup.`,
        feature1Desc2: product.feature1Desc2 || 'Backed by Adamjee Computers — Pakistan\'s trusted source for genuine gaming and PC hardware.',
        feature2Title: product.feature2Title || 'Universal Compatibility & Ergonomics',
        feature2Sub: product.feature2Sub || 'Works With Your Setup',
        feature2Desc: product.feature2Desc || 'Plug-and-play setup with no additional drivers required. Compatible with all major gaming platforms and professional workstation configurations.',
        feature2Desc2: product.feature2Desc2 || 'Full 1-year official warranty with Adamjee Computers support. 7-day returns for peace of mind.',
        feature2Img: product.feature2Img || product.image,
        feature3Title: product.feature3Title || 'Reliability & Durability',
        feature3Sub: product.feature3Sub || 'Built to Last',
        feature3Desc: product.feature3Desc || `Tested under extreme workloads to guarantee peak stability and long-lasting operation.`,
        feature3Desc2: product.feature3Desc2 || 'Official original product distributed in Pakistan.',
        feature3Img: product.feature3Img || product.image,
        accordionItems: product.accordionItems || [
          { title: 'Key Features', content: `Premium ${product.category || 'gaming'} hardware built for peak performance. ${product.name} delivers exceptional reliability for every use case.` },
          { title: 'Build & Design', content: 'Premium materials with ergonomic design. Built for extended daily use.' },
          { title: 'Package Included', content: '1× Main Unit, 1× Power/Data Cable, 1× User Manual, 1× Warranty Card.' },
          { title: 'Compatibility', content: 'Compatible with Windows 10/11, macOS 12+, Linux. Plug-and-play setup.' },
        ],
        colorLabel: product.colorLabel || 'Color',
        colors: (product.colors && product.colors.length > 0) ? product.colors : ['Black', 'White', 'Silver'],
      };
  }
}

/* ─── Stars ────────────────────────────────────────────────────── */
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function ProductListingPage({ handleAddToCart, formatPrice }: ProductListingPageProps) {
  const { id } = useParams() as { id: string };
  const [mounted, setMounted] = React.useState(false);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [fetchedProduct, setFetchedProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(true);
  const [mainImage, setMainImage] = useState(0);
  const [thumbStart, setThumbStart] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [addedPulse, setAddedPulse] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [engraving, setEngraving] = useState(false);
  const [relatedIndex, setRelatedIndex] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const [hoveredRelated, setHoveredRelated] = useState<string | null>(null);
  const [selectedRam, setSelectedRam] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState(0);

  // Set mounted after hydration to avoid SSR mismatch
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetch('/api/products?limit=100')
      .then(res => {
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return null;
        return res.json();
      })
      .then(data => {
        if (data && data.success && Array.isArray(data.products)) {
          setProductsList(data.products);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const matchFn = (p: Product) => {
      if (!p || !id) return false;
      const target = String(id).toLowerCase().trim();
      const decodedTarget = decodeURIComponent(target);
      return (
        String(p.id || '').toLowerCase().trim() === target ||
        String(p._id || '').toLowerCase().trim() === target ||
        String(p.slug || '').toLowerCase().trim() === target ||
        String(p.code || '').toLowerCase().trim() === target ||
        String(p.id || '').toLowerCase().trim() === decodedTarget ||
        String(p._id || '').toLowerCase().trim() === decodedTarget ||
        String(p.slug || '').toLowerCase().trim() === decodedTarget ||
        String(p.code || '').toLowerCase().trim() === decodedTarget
      );
    };

    if (id && !productsList.some(matchFn)) {
      fetch(`/api/products/${encodeURIComponent(id)}`)
        .then(res => {
          if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return null;
          return res.json();
        })
        .then(data => {
          if (data && data.success && data.product) {
            setFetchedProduct(data.product);
          }
        })
        .catch(console.error)
        .finally(() => setProductLoading(false));
    } else {
      setProductLoading(false);
    }
  }, [id, productsList]);

  const matchProduct = (p: Product) => {
    if (!p || !id) return false;
    const target = String(id).toLowerCase().trim();
    const decodedTarget = decodeURIComponent(target);
    return (
      String(p.id || '').toLowerCase().trim() === target ||
      String(p._id || '').toLowerCase().trim() === target ||
      String(p.slug || '').toLowerCase().trim() === target ||
      String(p.code || '').toLowerCase().trim() === target ||
      String(p.id || '').toLowerCase().trim() === decodedTarget ||
      String(p._id || '').toLowerCase().trim() === decodedTarget ||
      String(p.slug || '').toLowerCase().trim() === decodedTarget ||
      String(p.code || '').toLowerCase().trim() === decodedTarget
    );
  };

  const product = fetchedProduct
    || productsList.find(matchProduct)
    || (!id ? productsList[0] : null);

  useEffect(() => {
    if (product) {
      setMainImage(0);
      setThumbStart(0);
      setSelectedColor(0);
      setRelatedIndex(0);
      setOpenAccordion(0);
      setIsLiked(isInWishlist(product.id || product._id || ''));
    }
  }, [product?.id, product?._id]);

  /* Scroll reveal */
  useEffect(() => {
    if (!product) return;

    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-revealed'); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.pdp-up').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [product?.id, product?._id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0d233a] flex flex-col items-center justify-center p-8 text-white font-sans">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-white/80">Loading Product Details...</p>
      </div>
    );
  }


  const rawImages = (product.images && product.images.length > 0)
    ? product.images
    : [product.image, ...(product.additionalImages || [])];
  const images = Array.from(new Set(rawImages.filter((img): img is string => typeof img === 'string' && img.trim().length > 0)));
  if (images.length === 0 && product.image) {
    images.push(product.image);
  }

  /* Related: same category first, then others */
  const allAvailableProds = Array.from(new Map(productsList.map(p => [p.id || p._id || p.slug, p])).values());
  const relatedProducts = allAvailableProds
    .filter(p => (p.id !== product.id && p._id !== product._id))
    .sort((a, b) => {
      const aCat = a.category === product.category ? 0 : 1;
      const bCat = b.category === product.category ? 0 : 1;
      return aCat - bCat;
    })
    .slice(0, 6);

  /* Bundle: different category products */
  const bundleProducts = allAvailableProds
    .filter(p => (p.id !== product.id && p._id !== product._id) && p.category !== product.category)
    .slice(0, 2);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  /* Variations */
  const isAccessory = ["Headphones", "Earphones", "Speakers", "Accessories"].includes(product.category || "");
  const ramOptions = [{ label: '16GB', priceMod: 0 }, { label: '32GB', priceMod: 50 }, { label: '64GB', priceMod: 150 }];
  const storageOptions = [{ label: '1TB SSD', priceMod: 0 }, { label: '2TB SSD', priceMod: 100 }];
  const finalPrice = isAccessory ? product.price : product.price + ramOptions[selectedRam].priceMod + storageOptions[selectedStorage].priceMod;

  /* Dynamic content */
  const type = detectType(product);
  const fallbackContent = getDynamicContent(product, type);
  const content = {
    specBullets: product.specBullets && product.specBullets.length > 0 ? product.specBullets : fallbackContent.specBullets,
    feature1Title: product.feature1Title || fallbackContent.feature1Title,
    feature1Sub: product.feature1Sub || fallbackContent.feature1Sub,
    feature1Desc: product.feature1Desc || fallbackContent.feature1Desc,
    feature1Desc2: product.feature1Desc2 || fallbackContent.feature1Desc2,
    feature1Img: product.feature1Img || fallbackContent.feature1Img,
    feature2Title: product.feature2Title || fallbackContent.feature2Title,
    feature2Sub: product.feature2Sub || fallbackContent.feature2Sub,
    feature2Desc: product.feature2Desc || fallbackContent.feature2Desc,
    feature2Desc2: product.feature2Desc2 || fallbackContent.feature2Desc2,
    feature2Img: product.feature2Img || fallbackContent.feature2Img,
    feature3Title: product.feature3Title || fallbackContent.feature3Title,
    feature3Sub: product.feature3Sub || fallbackContent.feature3Sub,
    feature3Desc: product.feature3Desc || fallbackContent.feature3Desc,
    feature3Desc2: product.feature3Desc2 || fallbackContent.feature3Desc2,
    feature3Img: product.feature3Img || fallbackContent.feature3Img,
    accordionItems: product.accordionItems && product.accordionItems.length > 0 ? product.accordionItems : fallbackContent.accordionItems,
    colors: product.colors && product.colors.length > 0 ? product.colors : fallbackContent.colors,
    colorLabel: product.colorLabel || fallbackContent.colorLabel,
    portsBannerImg: fallbackContent.portsBannerImg,
  };

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) handleAddToCart({ ...product, price: finalPrice });
    setAddedPulse(true);
    setTimeout(() => setAddedPulse(false), 700);
  };

  const relatedVisible = 3;
  const relatedMax = Math.max(0, relatedProducts.length - relatedVisible);
  const colorSwatches = images.slice(0, Math.min(4, images.length));

  return (
    <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(180deg, #103256 0%, #0c2545 100%)' }}>
      <style>{`
        .pdp-up { opacity:0; transform:translateY(28px); transition: opacity 500ms cubic-bezier(0.22,1,0.36,1), transform 500ms cubic-bezier(0.22,1,0.36,1); }
        .pdp-up.is-revealed { opacity:1; transform:translateY(0); }
        .pdp-up.d1 { transition-delay:100ms; }
        .pdp-up.d2 { transition-delay:200ms; }
        .pdp-up.d3 { transition-delay:300ms; }
      `}</style>

      {/* ── NEON CHEVRONS ── */}
      <div className="fixed top-0 left-0 w-40 h-full opacity-10 pointer-events-none z-0">
        <svg viewBox="0 0 200 800" className="w-full h-full" fill="none">
          <path d="M 180,100 L 20,400 L 180,700" stroke="#7cb3d8" strokeWidth="3" strokeLinecap="round"/>
          <path d="M 140,80 L 0,400 L 140,720" stroke="#7cb3d8" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        </svg>
      </div>
      <div className="fixed top-0 right-0 w-40 h-full opacity-10 pointer-events-none z-0">
        <svg viewBox="0 0 200 800" className="w-full h-full" fill="none">
          <path d="M 20,100 L 180,400 L 20,700" stroke="#7cb3d8" strokeWidth="3" strokeLinecap="round"/>
          <path d="M 60,80 L 200,400 L 60,720" stroke="#7cb3d8" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        </svg>
      </div>

      {/* ── BREADCRUMB ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-10 pt-6 pb-0">
        <nav className="flex items-center gap-2 text-xs text-white/40 font-medium">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/category/all" className="hover:text-white transition-colors">Products</Link>
          <ChevronRight className="w-3 h-3" />
          {product.category && (
            <><Link href={`/category/${product.category.toLowerCase()}`} className="hover:text-white transition-colors">{product.category}</Link><ChevronRight className="w-3 h-3" /></>
          )}
          <span className="text-white/80 font-bold truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* ══════════════════════════════════════════════════
          PRODUCT HERO — dark theme, white text
      ══════════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* LEFT: Images */}
          <div className="space-y-4 pdp-up">
            <div className="relative rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 shadow-2xl" style={{ aspectRatio: '4/3', minHeight: 300, background: 'rgba(255,255,255,0.04)' }}>
              <img
                src={images[mainImage] || product.image}
                alt={product.name}
                className="w-full h-full object-contain p-6 transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getCategoryFallbackImage(product.category, product.name);
                }}
                style={{ filter: 'drop-shadow(0 8px 32px rgba(124,179,216,0.15))' }}
              />
              <button
                onClick={() => { const added = toggleWishlist(product.id || product._id || ''); setIsLiked(added); }}
                className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all border ${isLiked ? 'bg-red-500 text-white border-red-400' : 'bg-white/10 border-white/20 text-white/70 hover:text-red-400 backdrop-blur-sm'}`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              {product.tag && (
                <span className={`absolute top-4 left-4 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wide ${product.tag === 'Hot' ? 'bg-amber-400 text-black' : 'bg-white/15 text-white border border-white/20 backdrop-blur-sm'}`}>
                  {product.tag}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={() => setThumbStart(t => Math.max(0, t - 1))} disabled={thumbStart === 0}
                  className="w-8 h-8 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-white/60 hover:border-[#7cb3d8] hover:text-[#7cb3d8] transition-colors shrink-0 disabled:opacity-20">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-2 flex-1 overflow-hidden">
                  {images.slice(thumbStart, thumbStart + 5).map((img, i) => (
                    <button key={i + thumbStart} onClick={() => setMainImage(i + thumbStart)}
                      className={`flex-1 aspect-square rounded-xl border-2 flex items-center justify-center overflow-hidden transition-all ${mainImage === i + thumbStart ? 'border-[#7cb3d8] shadow-lg shadow-[#7cb3d8]/20' : 'border-white/15 hover:border-white/40'}`}
                      style={{ minWidth: 52, background: 'rgba(255,255,255,0.06)' }}>
                      <img src={img} alt={`View ${i}`} className="w-full h-full object-contain p-1.5" />
                    </button>
                  ))}
                </div>
                <button onClick={() => setThumbStart(t => Math.min(images.length - 1, t + 1))} disabled={thumbStart + 5 >= images.length}
                  className="w-8 h-8 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-white/60 hover:border-[#7cb3d8] hover:text-[#7cb3d8] transition-colors shrink-0 disabled:opacity-20">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Details */}
          <div className="flex flex-col space-y-5 pdp-up d1">
            <h1 className="text-3xl md:text-[2.5rem] font-light text-white leading-tight mb-2">{product.name}</h1>

            <div className="flex items-center justify-between">
              <span className="text-3xl font-light text-white">{formatPrice(finalPrice)}</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm font-light text-white/80">{product.rating.toFixed(1)}</span>
              </div>
            </div>

            <p className="text-sm text-white/80 leading-relaxed font-light">
              {product.description || `The ${product.name} is crafted for users who demand the best. Featuring premium build quality and exceptional performance, it elevates any gaming or workstation setup.`}
            </p>

            <div className="flex items-center gap-3 py-1">
              {product.discountPercent ? (
                <button
                  type="button"
                  onClick={() => handleCopyCode(`HERO${product.discountPercent}`)}
                  className="group relative inline-flex items-center gap-2 bg-[#7cb3d8]/20 border border-[#7cb3d8]/40 hover:border-[#7cb3d8] px-4 py-2 rounded-xl text-sm font-extrabold text-[#7cb3d8] transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>🔥 {product.discountPercent}% OFF (Use Code: HERO{product.discountPercent})</span>
                  <span className="text-[10px] bg-[#7cb3d8] text-[#103256] px-2 py-0.5 rounded font-black uppercase">
                    {copiedCode ? '✓ Copied!' : 'Copy Code'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleCopyCode('HERO25')}
                  className="group relative inline-flex items-center gap-2 bg-[#7cb3d8]/20 border border-[#7cb3d8]/40 hover:border-[#7cb3d8] px-4 py-2 rounded-xl text-sm font-extrabold text-[#7cb3d8] transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>🔥 25% Off (Use Code: HERO25)</span>
                  <span className="text-[10px] bg-[#7cb3d8] text-[#103256] px-2 py-0.5 rounded font-black uppercase">
                    {copiedCode ? '✓ Copied!' : 'Copy Code'}
                  </span>
                </button>
              )}
            </div>

            {/* Spec bullets */}
            <div className="space-y-3 mt-4">
              {content.specBullets.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-[#7cb3d8] text-[#103256]">
                    <CheckCircle className="w-3.5 h-3.5 fill-white" />
                  </div>
                  <span className="text-sm text-white font-light">{b}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 mt-6 border-t border-white/10" />

            {/* Color and Quantity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              {/* Color */}
              <div>
                <h3 className="text-base font-light text-white mb-4">Color : {content.colors[selectedColor]}</h3>
                <div className="flex flex-wrap gap-3">
                  {colorSwatches.length > 1 ? (
                    colorSwatches.map((img, i) => (
                      <button key={i} onClick={() => setSelectedColor(i)}
                        className={`w-12 h-12 rounded-md border flex items-center justify-center overflow-hidden transition-all ${selectedColor === i ? 'border-white' : 'border-white/20 hover:border-white/50'}`}
                        style={{ background: 'transparent' }}>
                        <img src={img} alt={`Option ${i}`} className="w-full h-full object-contain" />
                      </button>
                    ))
                  ) : (
                    content.colors.map((c, i) => (
                      <button key={i} onClick={() => setSelectedColor(i)}
                        className={`px-4 py-2 rounded-md text-sm font-light border transition-all ${selectedColor === i ? 'bg-transparent text-white border-white' : 'border-white/20 text-white/70 hover:border-white/50'}`}>
                        {c}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-base font-light text-white mb-4">Quantity</h3>
                <div className="flex items-center w-32 border border-white rounded-md overflow-hidden bg-transparent h-12">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"><Minus className="w-4 h-4" /></button>
                  <div className="flex-1 h-full flex items-center justify-center font-light text-white text-sm">{quantity}</div>
                  <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            {/* Engraving */}
            <div className="pt-6 space-y-2">
              <h3 className="text-base font-light text-white">Add Custom Text Engraving (Optional)</h3>
              <label className="flex items-start gap-3 cursor-pointer group mt-2">
                <input type="checkbox" checked={engraving} onChange={e => setEngraving(e.target.checked)} className="mt-1 w-4 h-4 rounded border-white/40 cursor-pointer bg-transparent accent-white" />
                <span className="text-sm font-light text-white group-hover:text-white transition-colors">Add Custom Text Engraving (Optional)</span>
              </label>
              <p className="text-xs text-white/60 font-light pt-2 leading-relaxed max-w-sm">
                Customized items cannot be returned or refunded. Please allow 5–7 business days for engraving.
              </p>
            </div>

            {/* Add to Cart */}
            <div className="pt-4">
              <button onClick={handleAdd}
                className={`w-full max-w-md h-[52px] rounded-full font-bold text-base transition-all duration-300 active:scale-[0.98] ${addedPulse ? 'bg-emerald-400 text-[#103256]' : 'bg-white text-[#103256] hover:bg-gray-100 hover:shadow-lg'}`}>
                {addedPulse ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
            </div>

            {/* Payment icons matching footer design */}
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <span className="text-[10px] text-white/60 font-semibold mr-1">Guaranteed Safe Checkout:</span>
              {[
                { name: 'VISA', bg: 'bg-white text-[#1a1a1a]', font: 'font-black tracking-widest' },
                { name: 'MasterCard', bg: 'bg-[#0a1b2d] text-white border border-white/20', font: 'font-extrabold' },
                { name: 'AMEX', bg: 'bg-[#0077a2] text-white', font: 'font-black' },
                { name: 'PayPal', bg: 'bg-[#003087] text-white', font: 'font-extrabold' },
                { name: 'Diners', bg: 'bg-[#004a97] text-white', font: 'font-bold' },
                { name: 'Discover', bg: 'bg-[#f9a01b] text-[#1a1a1a]', font: 'font-bold' },
              ].map((pay, i) => (
                <div key={i} className={`h-6 px-2.5 rounded-md text-[10px] ${pay.font} ${pay.bg} flex items-center justify-center tracking-tight shadow-sm select-none`}>
                  {pay.name}
                </div>
              ))}
            </div>

            <div className="pt-6 mt-4 border-t border-white/10" />

            {/* Bundle mini-cards — only render after client mount to avoid hydration mismatch */}
            {mounted && (
              <div>
                <p className="text-lg font-light text-[#7cb3d8] mb-4">Cart Adds Unlock 30% Off Bundles!</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bundleProducts.map((bp, idx) => (
                    <ProductCard
                      key={bp._id || bp.id || bp.slug || `bundle-${idx}`}
                      product={bp}
                      formatPrice={(amt) => formatPrice(amt)}
                      showBundleButton={true}
                      buttonLabel="Add to Bundle"
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          PORTS BANNER (Optional)
      ══════════════════════════════════════════════════ */}
      {content.portsBannerImg && (
        <section className="relative z-10 w-full pdp-up mt-10">
          <img src={content.portsBannerImg} alt="Ports Banner" className="w-full object-cover" />
        </section>
      )}

      {/* ══════════════════════════════════════════════════
          FEATURES — seamless dark continuation
      ══════════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-10 space-y-20">

        {/* Feature 1 (Full Width / Hero style if feature1Img is present) */}
        {content.feature1Img ? (
          <div className="relative rounded-3xl overflow-hidden min-h-[400px] flex items-center pdp-up shadow-2xl">
            <img src={content.feature1Img} alt={content.feature1Title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1b2d] to-transparent pointer-events-none" />
            <div className="relative z-10 p-10 md:p-16 max-w-xl space-y-6">
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight whitespace-pre-line">
                {content.feature1Title}
              </h2>
              <p className="text-white/70 text-base leading-relaxed">{content.feature1Desc}</p>
              <button className="px-8 py-3 bg-white text-[#103256] font-bold rounded-full hover:bg-gray-100 transition-colors">
                Buy Now
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center pdp-up">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-black text-white leading-tight whitespace-pre-line">
                {content.feature1Title}<br /><span className="text-[#7cb3d8]">{content.feature1Sub}</span>
              </h2>
              <p className="text-white/65 text-sm leading-relaxed">{content.feature1Desc}</p>
              <p className="text-white/50 text-sm leading-relaxed">{content.feature1Desc2}</p>
            </div>
            <div className="rounded-2xl border border-white/10 flex items-center justify-center p-6" style={{ minHeight: 220, background: 'rgba(255,255,255,0.04)' }}>
              <img src={product.image} alt={product.name} className="w-full h-full object-contain max-h-52" style={{ filter: 'drop-shadow(0 8px 32px rgba(124,179,216,0.2))' }} />
            </div>
          </div>
        )}

        {/* Feature 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center pdp-up d1">
          <div className="rounded-2xl border border-white/10 flex items-center justify-center p-4 overflow-hidden" style={{ minHeight: 250, background: 'rgba(255,255,255,0.04)' }}>
            <img src={content.feature2Img} alt={content.feature2Title} className="w-full h-full object-cover rounded-xl"
              onError={(e) => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(product.category, product.name); }}
              style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))' }} />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl md:text-4xl font-black text-white leading-tight whitespace-pre-line">
              {content.feature2Title}
            </h2>
            <p className="text-white/65 text-base leading-relaxed">{content.feature2Desc}</p>
            {content.feature2Desc2 && <p className="text-white/50 text-sm leading-relaxed">{content.feature2Desc2}</p>}
          </div>
        </div>

        {/* Feature 3 (Optional) */}
        {content.feature3Title && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center pdp-up d2">
            <div className="space-y-4 md:order-1 order-2">
              <h2 className="text-2xl md:text-4xl font-black text-white leading-tight whitespace-pre-line">
                {content.feature3Title}
              </h2>
              <p className="text-white/65 text-base leading-relaxed">{content.feature3Desc}</p>
              {content.feature3Desc2 && <p className="text-white/50 text-sm leading-relaxed">{content.feature3Desc2}</p>}
            </div>
            <div className="rounded-2xl border border-white/10 flex items-center justify-center p-4 md:order-2 order-1 overflow-hidden" style={{ minHeight: 250, background: 'rgba(255,255,255,0.04)' }}>
              <img src={content.feature3Img} alt={content.feature3Title} className="w-full h-full object-cover rounded-xl"
                onError={(e) => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(product.category, product.name); }}
                style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))' }} />
            </div>
          </div>
        )}

        {/* Accordion */}
        <div className="pdp-up d2">
          <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-10">
            Everything You <span className="text-[#7cb3d8]">Need To Know</span>
          </h2>
          <div className="space-y-3 max-w-2xl mx-auto">
            {content.accordionItems.map((item, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <button onClick={() => setOpenAccordion(openAccordion === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7cb3d8] shrink-0" />
                    <span className="text-sm font-bold text-white">{item.title}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-200 ${openAccordion === i ? 'rotate-180' : ''}`} />
                </button>
                {openAccordion === i && (
                  <div className="px-6 pb-5 border-t border-white/5">
                    <p className="text-sm text-white/55 leading-relaxed pt-3">{item.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          WHY CHOOSE US / TESTIMONIALS — matching homepage design
      ══════════════════════════════════════════════════ */}
      <Testimonials />

      {/* ══════════════════════════════════════════════════
          RELATED PRODUCTS — light section
      ══════════════════════════════════════════════════ */}
      <section className="bg-[#f5f5f7] py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <div className="flex items-end justify-between mb-8 pdp-up">
            <div>
              <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#103256] block mb-1">{product.category ? product.category.toUpperCase() : 'NEW ARRIVALS'}</span>
              <h2 className="text-3xl md:text-4xl font-black text-[#0a1b2d] tracking-tight">You May Also Like</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setRelatedIndex(i => Math.max(0, i - 1))} disabled={relatedIndex === 0}
                className="w-10 h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-500 hover:border-[#103256] hover:text-[#103256] transition-colors disabled:opacity-30">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setRelatedIndex(i => Math.min(relatedMax, i + 1))} disabled={relatedIndex >= relatedMax}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors hover:opacity-90 disabled:opacity-30" style={{ background: '#103256' }}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pdp-up d1">
            {relatedProducts.slice(relatedIndex, relatedIndex + relatedVisible).map((rp, idx) => (
              <ProductCard
                key={rp._id || rp.id || rp.slug || `rel-${idx}`}
                product={rp}
                formatPrice={(amt) => formatPrice(amt)}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {/* Customer Reviews */}
          <ProductReviews
            productId={product._id || product.id || id || product.code || product.slug || product.name}
            productName={product.name}
          />

          {/* Service strip */}
          <div className="mt-16 pt-12 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-0 pdp-up d2">
            {[
              { title: 'Gaming Consultation', desc: 'Get advice to choose the perfect gaming setup based on your performance and budget.' },
              { title: 'Upgrade Recommendations', desc: 'Find the best hardware upgrades to boost your gaming & streaming performance.' },
              { title: 'After-Sales Assistance', desc: 'Reliable support and assistance to help you with product guidance and troubleshooting.' },
            ].map((svc, i) => (
              <div key={i} className={`flex flex-col items-center text-center px-6 py-2 ${i < 2 ? 'md:border-r border-gray-200' : ''}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-3" style={{ background: '#103256' }}>
                  <CheckCircle className="w-4 h-4 text-white fill-white" />
                </div>
                <h4 className="text-base font-black text-[#0a1b2d] mb-1.5">{svc.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[220px]">{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
