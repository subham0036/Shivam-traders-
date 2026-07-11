import { useEffect, useState } from 'react';
import { adminAPI } from '../../../services';
import { showToast } from '../../../components/common/Toast';

const DEFAULT_QR = '/images/upi-qr.png';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [qrFile, setQrFile] = useState(null);

  useEffect(() => {
    adminAPI.getSettings().then(({ data }) => setSettings(data.data));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (qrFile) {
        const fd = new FormData();
        fd.append('siteName', settings.siteName || '');
        fd.append('tagline', settings.tagline || '');
        fd.append('contact', JSON.stringify(settings.contact || {}));
        fd.append('payment', JSON.stringify(settings.payment || {}));
        fd.append('shipping', JSON.stringify(settings.shipping || {}));
        fd.append('invoice', JSON.stringify(settings.invoice || {}));
        fd.append('qrCode', qrFile);
        await adminAPI.updateSettings(fd);
      } else {
        await adminAPI.updateSettings(settings);
      }
      showToast('Settings saved');
      setQrFile(null);
      const { data } = await adminAPI.getSettings();
      setSettings(data.data);
    } catch {
      showToast('Failed to save settings');
    }
  };

  if (!settings) return <div className="loading-spinner" />;

  const qrUrl = settings.payment?.upiQrCode?.url || DEFAULT_QR;

  return (
    <div>
      <div className="admin-page-header"><h1>Settings</h1></div>
      <form className="admin-card admin-form-stack" onSubmit={save}>
        <h3>Store</h3>
        <input className="form-control" placeholder="Store name" value={settings.siteName || ''} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
        <input className="form-control" placeholder="Tagline" value={settings.tagline || ''} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} />

        <h3>Contact</h3>
        <input className="form-control" placeholder="Phone" value={settings.contact?.phone || ''} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, phone: e.target.value } })} />
        <input className="form-control" placeholder="Email" value={settings.contact?.email || ''} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, email: e.target.value } })} />
        <textarea className="form-control" rows={2} placeholder="Address" value={settings.contact?.address || ''} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, address: e.target.value } })} />

        <h3>Payment (Manual UPI)</h3>
        <input className="form-control" placeholder="Account holder name" value={settings.payment?.upiName || ''} onChange={(e) => setSettings({ ...settings, payment: { ...settings.payment, upiName: e.target.value } })} />
        <input className="form-control" placeholder="UPI ID" value={settings.payment?.upiId || ''} onChange={(e) => setSettings({ ...settings, payment: { ...settings.payment, upiId: e.target.value } })} />
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>UPI QR Code</label>
          <img src={qrUrl} alt="UPI QR" className="admin-payment-screenshot" style={{ maxWidth: 220, marginBottom: 12 }} />
          <input type="file" accept="image/*" className="form-control" onChange={(e) => setQrFile(e.target.files[0])} />
        </div>

        <h3>Shipping & Tax</h3>
        <input className="form-control" type="number" placeholder="Free shipping above ₹" value={settings.shipping?.freeShippingThreshold || ''} onChange={(e) => setSettings({ ...settings, shipping: { ...settings.shipping, freeShippingThreshold: +e.target.value } })} />
        <input className="form-control" type="number" placeholder="Standard shipping ₹" value={settings.shipping?.standardShippingCharge || ''} onChange={(e) => setSettings({ ...settings, shipping: { ...settings.shipping, standardShippingCharge: +e.target.value } })} />
        <input className="form-control" placeholder="GST Number" value={settings.invoice?.gstNumber || ''} onChange={(e) => setSettings({ ...settings, invoice: { ...settings.invoice, gstNumber: e.target.value } })} />

        <button className="btn btn-primary">Save Settings</button>
      </form>
    </div>
  );
};

export default Settings;
