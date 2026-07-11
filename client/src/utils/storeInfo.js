export const STORE = {
  name: 'Shivam Traders',
  address: {
    line1: 'Shivam Traders, Jogbani',
    line2: 'Ashok Cinema Road, Ward No. 5',
    line3: 'Gupta Market, Araria (Bihar)',
    pincode: '854328',
    full: 'Shivam Traders, Jogbani, Ashok Cinema Road, Ward No. 5, Gupta Market, Araria (Bihar) — 854328',
  },
  phone: import.meta.env.VITE_PHONE_NUMBER || '+91 9065414511',
  phoneTel: (import.meta.env.VITE_PHONE_NUMBER || '+91 9065414511').replace(/\s/g, ''),
  whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || '919065414511',
  email: import.meta.env.VITE_EMAIL || 'gauravgupta241121@gmail.com',
  hours: import.meta.env.VITE_STORE_HOURS || 'Mon–Sat: 9AM – 8PM',
  mapsLink: import.meta.env.VITE_MAPS_LINK || '',
  mapsEmbed: import.meta.env.VITE_MAPS_EMBED || '',
  instagram: import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/guptamarket_pooja',
};
