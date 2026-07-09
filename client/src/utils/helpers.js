export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price || 0);

export const getDiscountPercent = (mrp, sellingPrice) => {
  if (!mrp || mrp <= sellingPrice) return 0;
  return Math.round(((mrp - sellingPrice) / mrp) * 100);
};

export const getSessionId = () => {
  let id = localStorage.getItem('st_session');
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('st_session', id);
  }
  return id;
};

export const GODS = ['Ganesha', 'Krishna', 'Shiva', 'Lakshmi', 'Hanuman', 'Durga', 'Saraswati', 'Ram', 'Vishnu', 'Kali'];
export const MATERIALS = [
  { value: 'brass', label: 'Brass' },
  { value: 'marble', label: 'Marble' },
  { value: 'wood', label: 'Wood' },
  { value: 'clay', label: 'Clay' },
  { value: 'resin', label: 'Resin' },
  { value: 'silver', label: 'Silver' },
  { value: 'copper', label: 'Copper' },
  { value: 'stone', label: 'Stone' },
];

export const ORDER_STATUS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
  refunded: 'Refunded',
};

export const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const shareProduct = async (product) => {
  const url = `${window.location.origin}/product/${product.slug}`;
  if (navigator.share) {
    await navigator.share({ title: product.name, url });
  } else {
    await navigator.clipboard.writeText(url);
    return 'Link copied!';
  }
};
