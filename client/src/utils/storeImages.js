/** Curated spiritual / murti imagery — avoid picsum random placeholders */

export const MURTI_IMAGES = {
  ganeshaStatue: 'https://images.unsplash.com/photo-1560420713-b279b33e9abf?w=900&q=85',
  ganeshaFlowers: 'https://images.unsplash.com/photo-1756860750470-f6b1267fcf9c?w=700&q=85',
  ganeshaFigurine: 'https://images.unsplash.com/photo-1567786778567-78673942-be055fed5d30?w=700&q=85',
  templeDiyas: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=700&q=85',
  pujaThali: 'https://images.unsplash.com/photo-1560420713-b279b33e9abf?w=700&q=85',
};

export const HERO_SHOWCASE = [
  { src: MURTI_IMAGES.ganeshaStatue, alt: 'Brass Ganesha murti', label: 'गणेश' },
  { src: MURTI_IMAGES.ganeshaFlowers, alt: 'Ganesha idol with flowers', label: 'विशेष संग्रह' },
  { src: MURTI_IMAGES.templeDiyas, alt: 'Temple diyas and puja', label: 'पूजा सामग्री' },
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

export const resolveProductImage = (url, index = 0) => {
  if (url && !isPlaceholderImage(url)) return url;
  return PRODUCT_PLACEHOLDERS[index % PRODUCT_PLACEHOLDERS.length];
};

export const resolveHeroBannerImage = (url) => {
  if (url && !isPlaceholderImage(url)) return url;
  return null;
};
