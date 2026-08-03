const getServerBase = () => (process.env.SERVER_URL || '').replace(/\/$/, '');

export const normalizeMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return url;

  const serverBase = getServerBase();
  if (serverBase && /^https?:\/\/(localhost|127\.0\.0\.1):\d+/i.test(url)) {
    return url.replace(/^https?:\/\/[^/]+/, serverBase);
  }

  return url;
};

export const normalizeProductMedia = (product) => {
  if (!product) return product;

  const doc = typeof product.toObject === 'function' ? product.toObject() : { ...product };

  if (Array.isArray(doc.images)) {
    doc.images = doc.images.map((img) => ({
      ...img,
      url: normalizeMediaUrl(img.url),
    }));
  }

  if (doc.video?.url) {
    doc.video = { ...doc.video, url: normalizeMediaUrl(doc.video.url) };
  }

  return doc;
};

export const normalizeProductsMedia = (products) =>
  (products || []).map((product) => normalizeProductMedia(product));
