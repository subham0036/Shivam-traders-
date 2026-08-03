import { useEffect, useState } from 'react';
import { adminAPI } from '../../../services';
import { showToast } from '../../../components/common/Toast';
import { HERO_SHOWCASE, resolveMediaUrl } from '../../../utils/storeImages';

const DEFAULT_QR = '/images/upi-qr.png';

const defaultShowcase = () => HERO_SHOWCASE.map((item) => ({
  label: item.label,
  alt: item.alt,
  link: item.link || '/shop',
  image: { url: item.src },
}));

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [showcaseFiles, setShowcaseFiles] = useState([null, null, null]);

  useEffect(() => {
    adminAPI.getSettings().then(({ data }) => {
      const s = data.data;
      if (!s.homeShowcase?.length) {
        s.homeShowcase = defaultShowcase();
      }
      setSettings(s);
    });
  }, []);

  const updateShowcase = (index, field, value) => {
    const homeShowcase = [...(settings.homeShowcase || defaultShowcase())];
    homeShowcase[index] = { ...homeShowcase[index], [field]: value };
    setSettings({ ...settings, homeShowcase });
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const hasFiles = qrFile || showcaseFiles.some(Boolean);
      if (hasFiles) {
        const fd = new FormData();
        fd.append('siteName', settings.siteName || '');
        fd.append('tagline', settings.tagline || '');
        fd.append('contact', JSON.stringify(settings.contact || {}));
        fd.append('payment', JSON.stringify(settings.payment || {}));
        fd.append('shipping', JSON.stringify(settings.shipping || {}));
        fd.append('invoice', JSON.stringify(settings.invoice || {}));
        fd.append('homeShowcase', JSON.stringify(settings.homeShowcase || []));
        if (qrFile) fd.append('qrCode', qrFile);
        showcaseFiles.forEach((file, i) => {
          if (file) fd.append(`showcase${i}`, file);
        });
        await adminAPI.updateSettings(fd);
      } else {
        await adminAPI.updateSettings(settings);
      }
      showToast('Settings saved');
      setQrFile(null);
      setShowcaseFiles([null, null, null]);
      const { data } = await adminAPI.getSettings();
      const s = data.data;
      if (!s.homeShowcase?.length) s.homeShowcase = defaultShowcase();
      setSettings(s);
    } catch {
      showToast('Failed to save settings');
    }
  };

  if (!settings) return <div className="loading-spinner" />;

  const qrUrl = settings.payment?.upiQrCode?.url || DEFAULT_QR;
  const showcaseItems = settings.homeShowcase?.length ? settings.homeShowcase : defaultShowcase();

  return (
    <div>
      <div className="admin-page-header"><h1>Settings</h1></div>
      <form className="admin-card admin-form-stack" onSubmit={save}>
        <h3>Store</h3>
        <input className="form-control" placeholder="Store name" value={settings.siteName || ''} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
        <input className="form-control" placeholder="Tagline" value={settings.tagline || ''} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} />

        <h3>Home — Premium Murtis (3 cards)</h3>
        <p className="muted" style={{ marginBottom: 12 }}>Edit the three showcase cards on the home page (Premium Murtis section).</p>
        {showcaseItems.map((item, i) => {
          const preview = showcaseFiles[i]
            ? URL.createObjectURL(showcaseFiles[i])
            : (item.image?.url ? resolveMediaUrl(item.image.url) : HERO_SHOWCASE[i]?.src);
          return (
            <div key={i} className="admin-showcase-card">
              <h4>Card {i + 1}</h4>
              {preview && (
                <img src={preview} alt={item.alt || `Showcase ${i + 1}`} className="admin-payment-screenshot" style={{ maxWidth: 160, marginBottom: 10, borderRadius: 8 }} />
              )}
              <input className="form-control" placeholder="Label (e.g. गणेश)" value={item.label || ''} onChange={(e) => updateShowcase(i, 'label', e.target.value)} />
              <input className="form-control" placeholder="Alt text" value={item.alt || ''} onChange={(e) => updateShowcase(i, 'alt', e.target.value)} />
              <input className="form-control" placeholder="Link (e.g. /shop or /shop?god=Ganesha)" value={item.link || '/shop'} onChange={(e) => updateShowcase(i, 'link', e.target.value)} />
              <input type="file" accept="image/*" className="form-control" onChange={(e) => {
                const next = [...showcaseFiles];
                next[i] = e.target.files[0] || null;
                setShowcaseFiles(next);
              }} />
            </div>
          );
        })}

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

        <h3>Shipping</h3>
        <input className="form-control" type="number" placeholder="Free shipping above ₹" value={settings.shipping?.freeShippingThreshold || ''} onChange={(e) => setSettings({ ...settings, shipping: { ...settings.shipping, freeShippingThreshold: +e.target.value } })} />
        <input className="form-control" type="number" placeholder="Standard shipping ₹" value={settings.shipping?.standardShippingCharge || ''} onChange={(e) => setSettings({ ...settings, shipping: { ...settings.shipping, standardShippingCharge: +e.target.value } })} />

        <button className="btn btn-primary">Save Settings</button>
      </form>
    </div>
  );
};

export default Settings;
