import 'dotenv/config';
import connectDB from '../config/db.js';
import Settings from '../models/Settings.js';

const UPI_ID = '9065414511@sbi';
const QR_URL = '/images/upi-qr.png';

const run = async () => {
  await connectDB();
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});

  settings.contact = {
    ...(settings.contact?.toObject?.() || settings.contact || {}),
    phone: process.env.STORE_PHONE || '+91 9065414511',
    email: process.env.STORE_EMAIL || '',
    address: 'Shivam Traders, Jogbani, Ashok Cinema Road, Ward No. 5, Gupta Market, Araria (Bihar) — 854328',
  };
  settings.markModified('contact');

  settings.payment = {
    ...(settings.payment?.toObject?.() || settings.payment || {}),
    upiId: UPI_ID,
    upiName: 'Gaurav Gupta',
    upiQrCode: { url: QR_URL, publicId: null },
    manualUpiEnabled: true,
  };
  settings.markModified('payment');
  await settings.save();

  console.log(`UPI settings saved: ${UPI_ID}`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
