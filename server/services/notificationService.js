import { sendEmail } from './emailService.js';

const baseTemplate = (title, body) => `
  <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px;">
    <h1 style="color: #D4AF37; margin-bottom: 8px;">Shivam Traders</h1>
    <h2 style="color: #7B2D26;">${title}</h2>
    ${body}
    <p style="margin-top: 24px; color: #FF9933;">🙏 Namaste</p>
  </div>
`;

const getCustomerEmail = (order) => order.user?.email || order.guestEmail;

export const notifyOrderStatus = async (order, note = '') => {
  const email = getCustomerEmail(order);
  if (!email) return;

  const statusMessages = {
    pending: 'Your order has been placed and is awaiting payment confirmation.',
    confirmed: 'Your payment is confirmed. We are preparing your order.',
    packing: 'Your order is being packed with care.',
    packed: 'Your order has been packed and is ready to ship.',
    shipped: `Your order has been shipped${order.courierName ? ` via ${order.courierName}` : ''}.`,
    out_for_delivery: 'Your order is out for delivery.',
    delivered: 'Your order has been delivered. Thank you for shopping with us!',
    cancelled: 'Your order has been cancelled.',
    refunded: 'Your order refund has been processed.',
  };

  const message = statusMessages[order.status] || `Order status updated to ${order.status}.`;
  const tracking = order.trackingNumber
    ? `<p>Tracking: <strong>${order.trackingNumber}</strong>${order.courierName ? ` (${order.courierName})` : ''}</p>`
    : '';

  await sendEmail({
    to: email,
    subject: `Order ${order.orderNumber} — ${order.status.replace(/_/g, ' ')} | Shivam Traders`,
    html: baseTemplate('Order Update', `
      <p>Order: <strong>${order.orderNumber}</strong></p>
      <p>${message}</p>
      ${note ? `<p><em>${note}</em></p>` : ''}
      ${tracking}
      <p>Track: <a href="${process.env.CLIENT_URL}/track-order?order=${order.orderNumber}">View order status</a></p>
    `),
  });
};

export const notifyPaymentApproved = async (order, note) => {
  const email = getCustomerEmail(order);
  if (!email) return;
  await sendEmail({
    to: email,
    subject: `Payment Approved — ${order.orderNumber} | Shivam Traders`,
    html: baseTemplate('Payment Approved', `
      <p>Your payment for order <strong>${order.orderNumber}</strong> has been verified.</p>
      <p>Total: <strong>₹${order.totalPrice.toLocaleString('en-IN')}</strong></p>
      ${note ? `<p>Note: ${note}</p>` : ''}
    `),
  });
};

export const notifyPaymentRejected = async (order, note) => {
  const email = getCustomerEmail(order);
  if (!email) return;
  await sendEmail({
    to: email,
    subject: `Payment Issue — ${order.orderNumber} | Shivam Traders`,
    html: baseTemplate('Payment Not Verified', `
      <p>We could not verify payment for order <strong>${order.orderNumber}</strong>.</p>
      ${note ? `<p>Reason: ${note}</p>` : ''}
      <p>Please contact us or re-upload your payment proof.</p>
    `),
  });
};

export const notifyOrderPlaced = async (order) => {
  const email = getCustomerEmail(order);
  if (!email) return;
  await sendEmail({
    to: email,
    subject: `Order Placed — ${order.orderNumber} | Shivam Traders`,
    html: baseTemplate('Order Received', `
      <p>Thank you! Order <strong>${order.orderNumber}</strong> has been placed.</p>
      <p>Total: <strong>₹${order.totalPrice.toLocaleString('en-IN')}</strong></p>
      <p>Payment: ${order.paymentMethod.toUpperCase()} — ${order.paymentStatus}</p>
    `),
  });
};
