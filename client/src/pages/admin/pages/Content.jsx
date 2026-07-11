import { useEffect, useState } from 'react';
import { adminAPI } from '../../../services';
import { showToast } from '../../../components/common/Toast';

const Content = () => {
  const [settings, setSettings] = useState(null);
  const [banner, setBanner] = useState({ title: '', subtitle: '', type: 'hero' });

  useEffect(() => {
    adminAPI.getSettings().then(({ data }) => setSettings(data.data));
  }, []);

  const addBanner = async (e) => {
    e.preventDefault();
    await adminAPI.addBanner(banner);
    showToast('Banner added');
    const { data } = await adminAPI.getSettings();
    setSettings(data.data);
  };

  if (!settings) return <div className="loading-spinner" />;

  return (
    <div>
      <div className="admin-page-header"><h1>Website Content</h1></div>
      <form className="admin-card admin-form-stack" onSubmit={addBanner}>
        <h3>Add Homepage Banner</h3>
        <input className="form-control" placeholder="Title" value={banner.title} onChange={(e) => setBanner({ ...banner, title: e.target.value })} />
        <input className="form-control" placeholder="Subtitle" value={banner.subtitle} onChange={(e) => setBanner({ ...banner, subtitle: e.target.value })} />
        <button className="btn btn-primary btn-sm">Add Banner</button>
      </form>
      <div className="admin-card">
        <h3>Active Banners</h3>
        {settings.banners?.map((b, i) => (
          <div key={i} className="admin-list-row static">
            <span>{b.title}</span>
            <span>{b.type} · {b.isActive ? 'Active' : 'Off'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Content;
