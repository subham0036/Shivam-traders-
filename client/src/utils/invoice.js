import { STORE } from './storeInfo';
import { resolveMediaUrl } from './storeImages';

export { resolveMediaUrl };

export const getStoreDetails = (settings) => ({
  name: settings?.siteName || STORE.name,
  tagline: settings?.tagline || 'Premium Hindu God Murtis',
  address: settings?.contact?.address || STORE.address.full,
  phone: settings?.contact?.phone || STORE.phone || '',
  email: settings?.contact?.email || STORE.email || '',
  hours: settings?.contact?.businessHours || STORE.hours,
});

export const buildInvoiceHtml = ({ order, settings }) => {
  const store = getStoreDetails(settings);
  const invoiceNo = order.invoiceNumber || order.orderNumber;
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const addr = order.shippingAddress || {};

  const rows = (order.items || []).map((i) => `
    <tr>
      <td class="product-cell">${i.name}</td>
      <td class="center">${i.quantity}</td>
      <td class="right">₹${Number(i.price).toLocaleString('en-IN')}</td>
      <td class="right amount">₹${Number(i.price * i.quantity).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const formatMoney = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoiceNo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, Georgia, serif;
      color: #2c1810;
      background: #f5f0eb;
      padding: 0;
      line-height: 1.5;
    }
    .print-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 14px 20px;
      background: #fff;
      border-bottom: 2px solid #D4AF37;
      box-shadow: 0 2px 12px rgba(44, 24, 16, 0.08);
    }
    .print-toolbar button {
      font-family: inherit;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.3px;
      padding: 11px 28px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      min-width: 140px;
    }
    .print-toolbar .btn-print {
      background: linear-gradient(135deg, #FF9933, #E67E00);
      color: #fff;
      box-shadow: 0 3px 10px rgba(255, 153, 51, 0.35);
    }
    .print-toolbar .btn-close {
      background: #fff;
      color: #7B2D26;
      border: 2px solid #D4AF37;
    }
    .print-wrap {
      padding: 24px 16px 40px;
      max-width: 860px;
      margin: 0 auto;
    }
    .invoice {
      background: #fff;
      border: 2px solid #D4AF37;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(123, 45, 38, 0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      padding: 28px 32px;
      background: linear-gradient(135deg, #7B2D26 0%, #5c1a1a 100%);
      color: #fff;
    }
    .header-left h1 { font-size: 26px; margin-bottom: 6px; letter-spacing: 0.3px; }
    .header-left .tagline { font-size: 13px; opacity: 0.92; margin-bottom: 12px; }
    .badge {
      display: inline-block;
      background: #FF9933;
      color: #fff;
      padding: 7px 16px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 12px;
      letter-spacing: 0.8px;
    }
    .store-meta {
      text-align: right;
      font-size: 13px;
      line-height: 1.65;
      opacity: 0.96;
      max-width: 280px;
    }
    .body { padding: 28px 32px 32px; }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 28px;
    }
    .meta-box {
      background: #FFF8F0;
      border: 1px solid #e8d5b5;
      border-radius: 10px;
      padding: 16px 18px;
      min-height: 100%;
    }
    .meta-box h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #FF9933;
      margin-bottom: 10px;
      font-weight: 700;
    }
    .meta-box p { font-size: 14px; line-height: 1.65; margin-bottom: 4px; }
    .meta-box p:last-child { margin-bottom: 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th {
      background: #FFF8F0;
      color: #7B2D26;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      padding: 12px 14px;
      text-align: left;
      border-bottom: 2px solid #D4AF37;
      font-weight: 700;
    }
    th.center, td.center { text-align: center; width: 72px; }
    th.right, td.right { text-align: right; width: 110px; }
    td {
      padding: 13px 14px;
      border-bottom: 1px solid #f0e0c8;
      font-size: 14px;
      vertical-align: top;
    }
    td.product-cell { font-weight: 500; }
    td.amount { font-weight: 600; color: #7B2D26; }
    tbody tr:last-child td { border-bottom: none; }
    .summary-row {
      display: flex;
      justify-content: flex-end;
    }
    .totals {
      width: min(100%, 320px);
      background: #FFF8F0;
      border: 1px solid #e8d5b5;
      border-radius: 10px;
      padding: 4px 18px;
    }
    .totals .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      padding: 10px 0;
      font-size: 14px;
      border-bottom: 1px dashed #e8d5b5;
    }
    .totals .row:last-child { border-bottom: none; }
    .totals .grand {
      font-size: 17px;
      font-weight: 700;
      color: #7B2D26;
      padding-top: 12px;
      padding-bottom: 8px;
      border-top: 2px solid #D4AF37;
      margin-top: 4px;
    }
    .footer {
      background: #FFF8F0;
      padding: 22px 32px;
      text-align: center;
      font-size: 13px;
      color: #7a6a5a;
      border-top: 1px solid #e8d5b5;
    }
    .footer strong { color: #7B2D26; display: block; margin-bottom: 6px; font-size: 14px; }
    @media (max-width: 640px) {
      .header { flex-direction: column; }
      .store-meta { text-align: left; max-width: none; }
      .meta-grid { grid-template-columns: 1fr; }
      .body { padding: 20px 16px; }
      .header { padding: 22px 18px; }
      th.right, td.right { width: 88px; font-size: 12px; }
      .print-toolbar { flex-wrap: wrap; padding: 12px; }
      .print-toolbar button { flex: 1; min-width: 120px; }
    }
    @media print {
      body { background: #fff; }
      .print-toolbar { display: none !important; }
      .print-wrap { padding: 0; max-width: none; }
      .invoice { border: none; box-shadow: none; border-radius: 0; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body>
  <div class="print-toolbar">
    <button type="button" class="btn-print" onclick="window.print()">🖨 Print Invoice</button>
    <button type="button" class="btn-close" onclick="window.close()">Close</button>
  </div>
  <div class="print-wrap">
    <div class="invoice">
      <div class="header">
        <div class="header-left">
          <h1>🕉 ${store.name}</h1>
          <p class="tagline">${store.tagline}</p>
          <span class="badge">INVOICE</span>
        </div>
        <div class="store-meta">
          <div>${store.address.replace(/, /g, '<br/>')}</div>
          <div style="margin-top:8px">📞 ${store.phone}</div>
          <div>✉ ${store.email}</div>
        </div>
      </div>

      <div class="body">
        <div class="meta-grid">
          <div class="meta-box">
            <h3>Invoice Details</h3>
            <p><strong>Invoice No:</strong> ${invoiceNo}</p>
            <p><strong>Order No:</strong> ${order.orderNumber}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Payment:</strong> ${(order.paymentMethod || '').toUpperCase()} — ${order.paymentStatus}</p>
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
            <tr>
              <th>Product</th>
              <th class="center">Qty</th>
              <th class="right">Rate (₹)</th>
              <th class="right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="summary-row">
          <div class="totals">
            <div class="row"><span>Subtotal</span><span>${formatMoney(order.itemsPrice)}</span></div>
            ${order.couponDiscount ? `<div class="row"><span>Coupon Discount</span><span>-${formatMoney(order.couponDiscount)}</span></div>` : ''}
            <div class="row"><span>Shipping</span><span>${order.shippingPrice === 0 ? 'FREE' : formatMoney(order.shippingPrice)}</span></div>
            <div class="row grand"><span>Grand Total</span><span>${formatMoney(order.totalPrice)}</span></div>
          </div>
        </div>
      </div>

      <div class="footer">
        <strong>Thank you for your purchase!</strong>
        <p>For queries contact us at ${store.phone} or ${store.email}</p>
        <p style="margin-top:4px">${store.hours}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
};

export const openInvoicePrint = ({ order, settings }) => {
  const html = buildInvoiceHtml({ order, settings });
  const w = window.open('', '_blank');
  if (!w) {
    alert('Please allow pop-ups to view and print the invoice.');
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
};
