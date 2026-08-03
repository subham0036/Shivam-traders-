/** Curated spiritual / murti imagery — avoid picsum random placeholders */

export const MURTI_IMAGES = {
  ganeshaStatue: 'https://images.unsplash.com/photo-1560420713-b279b33e9abf?w=900&q=85',
  ganeshaFlowers: 'https://images.unsplash.com/photo-1756860750470-f6b1267fcf9c?w=700&q=85',
  ganeshaFigurine: 'https://images.unsplash.com/photo-1567786778567-78673942-be055fed5d30?w=700&q=85',
  templeDiyas: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=700&q=85',
  pujaThali: 'https://images.unsplash.com/photo-1560420713-b279b33e9abf?w=700&q=85',
};

export const HERO_SHOWCASE = [
  { src: MURTI_IMAGES.ganeshaStatue, alt: 'Brass Ganesha murti', label: 'गणेश', link: '/shop' },
  { src: MURTI_IMAGES.ganeshaFlowers, alt: 'Ganesha idol with flowers', label: 'विशेष संग्रह', link: '/shop' },
  { src: MURTI_IMAGES.ganeshaFigurine, alt: 'Premium handcrafted murti', label: 'प्रीमियम मूर्ति', link: '/shop' },
];

export const PRODUCT_PLACEHOLDERS = [
  MURTI_IMAGES.ganeshaStatue,
  MURTI_IMAGES.ganeshaFlowers,
  MURTI_IMAGES.templeDiyas,
  MURTI_IMAGES.ganeshaFigurine,
];

export const DEITY_IMAGES = {
  Ganesha: MURTI_IMAGES.ganeshaStatue,
  Krishna: MURTI_IMAGES.ganeshaFlowers,
  Shiva: MURTI_IMAGES.templeDiyas,
  Lakshmi: MURTI_IMAGES.ganeshaFlowers,
  Hanuman: MURTI_IMAGES.ganeshaFigurine,
  Durga: MURTI_IMAGES.ganeshaStatue,
  Saraswati: MURTI_IMAGES.templeDiyas,
  Ram: MURTI_IMAGES.ganeshaFigurine,
  Vishnu: MURTI_IMAGES.ganeshaStatue,
  Kali: MURTI_IMAGES.templeDiyas,
};

export const isPlaceholderImage = (url) => {
  if (!url) return true;
  return /picsum\.photos|placeholder|seed\/st\d/i.test(url);
};

export const isLocalMediaUrl = (url) =>
  /^https?:\/\/(localhost|127\.0\.0\.1):\d+/i.test(url || '');

export const isLiveSite = () =>
  typeof window !== 'undefined' && !/localhost|127\.0\.0\.1/.test(window.location.hostname);

export const getServerBase = () => {
  const api = import.meta.env.VITE_API_URL || '';
  if (api.startsWith('http')) return api.replace(/\/api\/?$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:5002';
};

export const isRenderUploadUrl = (url) =>
  /onrender\.com\/uploads\//i.test(url || '');

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/uploads/')) {
    return `${getServerBase()}${url}`;
  }
  if (isLocalMediaUrl(url) || isRenderUploadUrl(url)) {
    const pathPart = url.replace(/^https?:\/\/[^/]+/, '');
    return `${getServerBase()}${pathPart}`;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${getServerBase()}${url.startsWith('/') ? url : `/${url}`}`;
};

export const pickProductImageUrl = (images = [], fallbackIndex = 0) => {
  const urls = (images || []).map((img) => img?.url).filter(Boolean);

  for (const url of urls) {
    const resolved = resolveMediaUrl(url);
    if (resolved && !isPlaceholderImage(resolved)) {
      return resolved;
    }
  }

  return PRODUCT_PLACEHOLDERS[fallbackIndex % PRODUCT_PLACEHOLDERS.length];
};

export const resolveProductImages = (images = [], fallbackIndex = 0) => {
  const resolved = (images || [])
    .map((img) => ({ ...img, url: resolveMediaUrl(img?.url) }))
    .filter((img) => img.url && !isPlaceholderImage(img.url));

  if (resolved.length) return resolved;

  return [{ url: PRODUCT_PLACEHOLDERS[fallbackIndex % PRODUCT_PLACEHOLDERS.length], alt: 'Product' }];
};

export const resolveProductImage = (urlOrImages, index = 0) => {
  if (Array.isArray(urlOrImages)) {
    return pickProductImageUrl(urlOrImages, index);
  }
  if (urlOrImages && typeof urlOrImages === 'object' && urlOrImages.url) {
    return pickProductImageUrl([urlOrImages], index);
  }
  const url = urlOrImages;
  if (url && !isPlaceholderImage(url)) {
    return resolveMediaUrl(url);
  }
  return PRODUCT_PLACEHOLDERS[index % PRODUCT_PLACEHOLDERS.length];
};

export const resolveHeroBannerImage = (url) => {
  if (url && !isPlaceholderImage(url)) return url;
  return null;
};
