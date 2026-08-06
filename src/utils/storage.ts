
export const getCategoryFallbackImage = (category?: string, name?: string): string => {
  const cat = (category || '').toLowerCase();
  const n = (name || '').toLowerCase();
  if (cat.includes('desktop') || cat.includes('pc') || n.includes('pc') || n.includes('titan') || n.includes('eclipse') || n.includes('phantom') || n.includes('rig') || n.includes('build')) {
    return '/images/custom_blue_gaming_pc_cases_1780242165601.png';
  }
  if (cat.includes('headphone') || n.includes('headphone') || n.includes('headset') || n.includes('airpod')) {
    return '/images/headphones_red_black_1780246535746.png';
  }
  if (cat.includes('earphone') || n.includes('earbud') || n.includes('earphone') || n.includes('bud')) {
    return '/images/new_earbuds_transparent.png';
  }
  if (cat.includes('monitor') || n.includes('monitor') || n.includes('screen') || n.includes('display')) {
    return '/images/dell_led_monitor_1780238004077.png';
  }
  if (cat.includes('laptop') || n.includes('laptop') || n.includes('notebook')) {
    return '/images/deal-laptop.png';
  }
  if (n.includes('mouse') || n.includes('mice')) {
    return '/images/glowing_gaming_mouse_1780246484998.png';
  }
  if (n.includes('keyboard')) {
    return '/images/mechanical_keyboard_1780238028029.png';
  }
  if (n.includes('chair')) {
    return '/images/gaming_chair_blue_1780246513295.png';
  }
  if (n.includes('gpu') || n.includes('graphics') || n.includes('rtx')) {
    return '/images/rtx_graphics_card_1780238052630.png';
  }
  return '/images/custom_blue_gaming_pc_cases_1780242165601.png';
};

export const getProductImage = (product: any): string => {
  if (!product) return getCategoryFallbackImage();
  let img = product.image;
  if (!img || typeof img !== 'string' || img.trim().length === 0) {
    img = Array.isArray(product.images) && product.images.find((i: any) => typeof i === 'string' && i.trim().length > 0);
  }
  if (!img || typeof img !== 'string' || img.trim().length === 0) {
    img = Array.isArray(product.additionalImages) && product.additionalImages.find((i: any) => typeof i === 'string' && i.trim().length > 0);
  }
  if (img && typeof img === 'string' && img.trim().length > 0 && !img.includes('placeholder')) {
    return img;
  }
  return getCategoryFallbackImage(product?.category, product?.name);
};

export const getProducts = (): any[] => {

  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('adamjee_products');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

// ─── Wishlist ───────────────────────────────────────────────────────────────

// A wishlist is a per-browser preference, not store data, so it legitimately
// lives in localStorage. Everything else — products, orders, messages, blogs —
// now comes from the database via the API.

export const getWishlist = (): string[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('adamjee_wishlist');
  return data ? JSON.parse(data) : [];
};

export const toggleWishlist = (productId: string): boolean => {
  if (typeof window === 'undefined') return false;
  const wishlist = getWishlist();
  const index = wishlist.indexOf(productId);
  let added = false;
  if (index > -1) {
    wishlist.splice(index, 1);
  } else {
    wishlist.push(productId);
    added = true;
  }
  localStorage.setItem('adamjee_wishlist', JSON.stringify(wishlist));
  return added;
};

export const isInWishlist = (productId: string): boolean => {
  if (typeof window === 'undefined') return false;
  return getWishlist().includes(productId);
};

export interface BlogItem {
  _id?: string;
  id?: string;
  title: string;
  slug?: string;
  content: string;
  author?: string;
  image?: string;
  category?: string;
  excerpt?: string;
  isPublished?: boolean;
  publishedAt?: string;
  createdAt?: string;
}
