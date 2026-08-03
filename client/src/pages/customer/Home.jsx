import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import ProductCard from '../../components/common/ProductCard';
import { productAPI, adminAPI } from '../../services';
import { GODS, MATERIALS } from '../../utils/helpers';
import { HERO_SHOWCASE, DEITY_IMAGES, MURTI_IMAGES, resolveMediaUrl } from '../../utils/storeImages';
import './Home.css';

const mapShowcaseFromSettings = (items) => {
  if (!items?.length) return HERO_SHOWCASE;
  return items.map((item, i) => ({
    src: item.image?.url ? resolveMediaUrl(item.image.url) : HERO_SHOWCASE[i]?.src || MURTI_IMAGES.ganeshaStatue,
    alt: item.alt || HERO_SHOWCASE[i]?.alt || 'Premium murti',
    label: item.label || HERO_SHOWCASE[i]?.label || 'मूर्ति',
    link: item.link || '/shop',
  }));
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [premiumShowcase, setPremiumShowcase] = useState(HERO_SHOWCASE);
  const [premiumTitle, setPremiumTitle] = useState('Premium Murtis');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [all, best, newest, settingsRes] = await Promise.all([
          productAPI.getAll({ limit: 16 }),
          productAPI.getAll({ bestSeller: true, limit: 8 }),
          productAPI.getAll({ newArrival: true, limit: 8 }),
          adminAPI.getSettings().catch(() => null),
        ]);
        setProducts(all.data.data);
        setBestSellers(best.data.data);
        setNewArrivals(newest.data.data);
        if (settingsRes?.data?.data) {
          const s = settingsRes.data.data;
          if (s.homeShowcaseTitle) setPremiumTitle(s.homeShowcaseTitle);
          if (s.homeShowcase?.length) {
            setPremiumShowcase(mapShowcaseFromSettings(s.homeShowcase));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const shopGods = GODS.slice(0, 9);

  return (
    <>
      <SEO schema={{
        '@context': 'https://schema.org',
        '@type': 'Store',
        name: 'Shivam Traders',
        description: 'Premium Hindu God Murtis',
        url: import.meta.env.VITE_SITE_URL,
      }} />

      <section className="hero-store hero-store-compact">
        <div className="container hero-store-inner">
          <div className="hero-store-copy">
            <span className="hero-store-badge">🕉 Shivam Traders</span>
            <h1>Premium Murtis</h1>
            <p className="hero-store-hindi">दिव्य मूर्तियाँ — Shop brass, marble & wood idols</p>
            <Link to="/shop" className="btn btn-primary btn-lg hero-store-cta">Shop All Murtis</Link>
          </div>
        </div>
      </section>

      {newArrivals.length > 0 && (
        <section className="home-products-section">
          <div className="container">
            <div className="home-section-head">
              <h2>New Arrivals</h2>
              <Link to="/shop?newArrival=true" className="home-see-all">See all →</Link>
            </div>
            <div className="home-product-grid home-product-grid-compact">
              {newArrivals.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      <section className="home-products-section home-products-section-alt home-premium-section">
        <div className="container">
          <div className="home-section-head">
            <h2>{premiumTitle}</h2>
            <Link to="/shop?premium=true" className="home-see-all">See all →</Link>
          </div>
          <div className="hero-showcase">
            {premiumShowcase.map((item) => (
              <Link key={`${item.label}-${item.src}`} to={item.link || '/shop'} className="hero-showcase-card">
                <img src={item.src} alt={item.alt} loading="lazy" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-products-section">
        <div className="container">
          <div className="home-section-head">
            <h2>Our Collection</h2>
            <Link to="/shop" className="home-see-all">View shop →</Link>
          </div>
          {loading ? (
            <div className="loading-spinner" />
          ) : (
            <div className="home-product-grid">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
          <div className="home-section-foot">
            <Link to="/shop" className="btn btn-primary btn-lg">Browse All Products</Link>
          </div>
        </div>
      </section>

      {bestSellers.length > 0 && (
        <section className="home-products-section home-products-section-alt">
          <div className="container">
            <div className="home-section-head">
              <h2>Best Sellers</h2>
              <Link to="/shop?bestSeller=true" className="home-see-all">See all →</Link>
            </div>
            <div className="home-product-grid home-product-grid-compact">
              {bestSellers.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      <section className="home-products-section">
        <div className="container">
          <div className="home-section-head">
            <h2>Shop by Deity</h2>
            <Link to="/categories" className="home-see-all">See all →</Link>
          </div>
          <div className="deity-grid">
            {shopGods.map((god) => (
              <Link key={god} to={`/shop?god=${god}`} className="deity-card">
                <img src={DEITY_IMAGES[god] || MURTI_IMAGES.ganeshaStatue} alt={`${god} murti`} loading="lazy" />
                <span>{god}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-materials">
        <div className="container">
          <div className="material-chips">
            {MATERIALS.map((m) => (
              <Link key={m.value} to={`/shop?material=${m.value}`} className="material-chip">
                {m.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
