import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../../services';
import { showToast } from '../../../components/common/Toast';
import { HERO_SHOWCASE, resolveMediaUrl } from '../../../utils/storeImages';

const buildDefaultCards = () => HERO_SHOWCASE.map((item) => ({
  label: item.label,
  alt: item.alt,
  link: item.link || '/shop',
  imageUrl: item.src,
}));

const PremiumMurtis = () => {
  const [sectionTitle, setSectionTitle] = useState('Premium Murtis');
  const [cards, setCards] = useState(buildDefaultCards());
  const [imageFiles, setImageFiles] = useState([null, null, null]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getSettings()
      .then(({ data }) => {
        const s = data.data;
        if (s.homeShowcaseTitle) setSectionTitle(s.homeShowcaseTitle);
        if (s.homeShowcase?.length) {
          setCards(s.homeShowcase.map((item, i) => ({
            label: item.label || HERO_SHOWCASE[i]?.label || '',
            alt: item.alt || HERO_SHOWCASE[i]?.alt || '',
            link: item.link || '/shop',
            imageUrl: item.image?.url || HERO_SHOWCASE[i]?.src || '',
          })));
        }
      })
      .catch(() => showToast('Could not load showcase'))
      .finally(() => setLoading(false));
  }, []);

  const updateCard = (index, field, value) => {
    setCards((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('sectionTitle', sectionTitle);
      fd.append('homeShowcase', JSON.stringify(cards.map((card) => ({
        label: card.label,
        alt: card.alt,
        link: card.link,
        image: card.imageUrl ? { url: card.imageUrl } : undefined,
      }))));
      imageFiles.forEach((file, i) => {
        if (file) fd.append(`showcase${i}`, file);
      });
      const { data } = await adminAPI.updateHomeShowcase(fd);
      if (data.data?.homeShowcaseTitle) setSectionTitle(data.data.homeShowcaseTitle);
      if (data.data?.homeShowcase?.length) {
        setCards(data.data.homeShowcase.map((item, i) => ({
          label: item.label || '',
          alt: item.alt || '',
          link: item.link || '/shop',
          imageUrl: item.image?.url || '',
        })));
      }
      setImageFiles([null, null, null]);
      showToast('Premium Murtis section saved!');
    } catch {
      showToast('Failed to save — please try again');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-spinner" />;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Premium Murtis — Home Section</h1>
        <Link to="/" target="_blank" className="btn btn-outline btn-sm">
          Preview home page ↗
        </Link>
      </div>

      <form className="admin-card admin-form-stack" onSubmit={save}>
        <p className="muted">
          Edit the three showcase cards shown in the <strong>Premium Murtis</strong> section on your home page.
          Changes appear after you save.
        </p>

        <div className="form-group">
          <label>Section heading</label>
          <input
            className="form-control"
            placeholder="Premium Murtis"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
          />
        </div>

        {cards.map((card, i) => {
          const preview = imageFiles[i]
            ? URL.createObjectURL(imageFiles[i])
            : (card.imageUrl ? resolveMediaUrl(card.imageUrl) : HERO_SHOWCASE[i]?.src);
          return (
            <div key={i} className="admin-showcase-card">
              <h4>Card {i + 1}</h4>
              {preview && (
                <img
                  src={preview}
                  alt={card.alt || `Card ${i + 1}`}
                  className="admin-payment-screenshot"
                  style={{ maxWidth: 200, marginBottom: 10, borderRadius: 8 }}
                />
              )}
              <input
                className="form-control"
                placeholder="Label (e.g. गणेश)"
                value={card.label}
                onChange={(e) => updateCard(i, 'label', e.target.value)}
              />
              <input
                className="form-control"
                placeholder="Alt text (for accessibility)"
                value={card.alt}
                onChange={(e) => updateCard(i, 'alt', e.target.value)}
              />
              <input
                className="form-control"
                placeholder="Link (e.g. /shop or /shop?god=Ganesha)"
                value={card.link}
                onChange={(e) => updateCard(i, 'link', e.target.value)}
              />
              <input
                className="form-control"
                placeholder="Image URL (optional if uploading file)"
                value={card.imageUrl}
                onChange={(e) => updateCard(i, 'imageUrl', e.target.value)}
              />
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
                  Upload image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(e) => {
                    const next = [...imageFiles];
                    next[i] = e.target.files[0] || null;
                    setImageFiles(next);
                  }}
                />
              </div>
            </div>
          );
        })}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Premium Murtis Section'}
        </button>
      </form>
    </div>
  );
};

export default PremiumMurtis;
