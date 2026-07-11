import { STORE } from './storeInfo';

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
  const serverBase = apiBase.replace(/\/api\/?$/, '');
  return `${serverBase}${url.startsWith('/') ? url : `/${url}`}`;
};

export const getStoreDetails = (settings) => ({
  name: settings?.siteName || STORE.name,
  tagline: settings?.tagline || 'Premium Hindu God Murtis',
  address: settings?.contact?.address || STORE.address.full,
  phone: settings?.contact?.phone || STORE.phone || '',
  email: settings?.contact?.email || STORE.email || '',
  gst: settings?.invoice?.gstNumber || '',
  hours: settings?.contact?.businessHours || STORE.hours,
});

export const buildInvoiceHtml = ({ order, settings }) => {
  const store = getStoreDetails(settings);
  const invoiceNo = order.invoiceNumber || order.orderNumber;
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const addr = order.shippingAddress || {};

  const rows = (order.items || []).map((i) => `
    <tr>
      <td>${i.name}</td>
      <td class="center">${i.quantity}</td>
      <td class="right">₹${i.price.toLocaleString('en-IN')}</td>
      <td class="right">₹${(i.price * i.quantity).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${invoiceNo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Georgia, serif; color: #2c1810; background: #fff; padding: 32px; }
    .invoice { max-width: 800px; margin: 0 auto; border: 2px solid #D4AF37; border-radius: 12px; overflow: hidden; }
    .header { display: flex; justify-content: space-between; gap: 24px; padding: 28px 32px; background: linear-gradient(135deg, #7B2D26 0%, #5c1a1a 100%); color: #fff; }
    .header h1 { font-size: 28px; margin-bottom: 4px; }
    .header .tagline { font-size: 13px; opacity: 0.9; }
    .header .store-meta { text-align: right; font-size: 13px; line-height: 1.6; opacity: 0.95; }
    .badge { display: inline-block; background: #FF9933; color: #fff; padding: 8px 18px; border-radius: 20px; font-weight: 700; font-size: 14px; margin-top: 8px; }
    .body { padding: 28px 32px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
    .meta-box { background: #FFF8F0; border: 1px solid #f0e0c8; border-radius: 10px; padding: 16px 18px; }
    .meta-box h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #FF9933; margin-bottom: 10px; }
    .meta-box p { font-size: 14px; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #FFF8F0; color: #7B2D26; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 12px; text-align: left; border-bottom: 2px solid #D4AF37; }
    td { padding: 12px; border-bottom: 1px solid #f0e0c8; font-size: 14px; }
    .center { text-align: center; }
    .right { text-align: right; }
    .totals { margin-left: auto; width: 280px; }
    .totals .row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px dashed #f0e0c8; }
    .totals .grand { font-size: 18px; font-weight: 700; color: #7B2D26; border-bottom: none; padding-top: 12px; }
    .footer { background: #FFF8F0; padding: 20px 32px; text-align: center; font-size: 13px; color: #7a6a5a; border-top: 1px solid #f0e0c8; }
    .footer strong { color: #7B2D26; }
    @media print { body { padding: 0; } .invoice { border: none; } }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div>
        <h1>🕉 ${store.name}</h1>
        <p class="tagline">${store.tagline}</p>
        <span class="badge">TAX INVOICE</span>
      </div>
      <div class="store-meta">
        <div>${store.address.replace(/, /g, '<br/>')}</div>
        <div style="margin-top:8px">📞 ${store.phone}</div>
        <div>✉ ${store.email}</div>
        ${store.gst ? `<div style="margin-top:4px">GSTIN: ${store.gst}</div>` : ''}
      </div>
    </div>

    <div class="body">
      <div class="meta-grid">
        <div class="meta-box">
          <h3>Invoice Details</h3>
          <p><strong>Invoice No:</strong> ${invoiceNo}</p>
          <p><strong>Order No:</strong> ${order.orderNumber}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Payment:</strong> ${order.paymentMethod?.toUpperCase()} — ${order.paymentStatus}</p>
        </div>
        <div class="meta-box">
          <h3>Bill To</h3>
          <p><strong>${addr.fullName || '—'}</strong></p>
          <p>${addr.addressLine1 || ''}${addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
          <p>${addr.city || ''}, ${addr.state || ''} — ${addr.pincode || ''}</p>
          <p>📞 ${addr.phone || order.guestPhone || '—'}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr><th>Product</th><th class="center">Qty</th><th class="right">Rate</th><th class="right">Amount</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="totals">
        <div class="row"><span>Subtotal</span><span>₹${(order.itemsPrice || 0).toLocaleString('en-IN')}</span></div>
        ${order.couponDiscount ? `<div class="row"><span>Coupon Discount</span><span>-₹${order.couponDiscount.toLocaleString('en-IN')}</span></div>` : ''}
        <div class="row"><span>Shipping</span><span>${order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice.toLocaleString('en-IN')}`}</span></div>
        <div class="row"><span>GST</span><span>₹${(order.taxPrice || 0).toLocaleString('en-IN')}</span></div>
        <div class="row grand"><span>Grand Total</span><span>₹${order.totalPrice.toLocaleString('en-IN')}</span></div>
      </div>
    </div>

    <div class="footer">
      <p><strong>Thank you for your purchase!</strong></p>
      <p style="margin-top:6px">For queries contact us at ${store.phone} or ${store.email}</p>
      <p style="margin-top:4px">${store.hours}</p>
    </div>
  </div>
</body>
</html>`;
};

export const openInvoicePrint = ({ order, settings }) => {
  const html = buildInvoiceHtml({ order, settings });
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
};
