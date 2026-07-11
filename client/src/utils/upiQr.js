import QRCode from 'qrcode';

export const UPI_DEFAULTS = {
  upiId: '9065414511@sbi',
  upiName: 'Gaurav Gupta',
  qrUrl: '/images/upi-qr.png',
};

/** Build NPCI UPI deep link with pre-filled amount */
export const buildUpiPaymentUri = ({ upiId, upiName, amount, note }) => {
  const params = new URLSearchParams();
  params.set('pa', upiId);
  if (upiName) params.set('pn', upiName);
  if (amount != null && amount > 0) params.set('am', Number(amount).toFixed(2));
  params.set('cu', 'INR');
  if (note) params.set('tn', String(note).slice(0, 80));
  return `upi://pay?${params.toString()}`;
};

/** Generate QR code data URL with order amount embedded */
export const generateUpiQr = async ({ upiId, upiName, amount, note }) => {
  const uri = buildUpiPaymentUri({ upiId, upiName, amount, note });
  return QRCode.toDataURL(uri, {
    width: 280,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#2c1810', light: '#ffffff' },
  });
};
