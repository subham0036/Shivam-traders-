import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiShield, FiTruck, FiAward } from 'react-icons/fi';
import SEO from '../../components/common/SEO';
import ProductCard from '../../components/common/ProductCard';
import { productAPI, adminAPI } from '../../services';
import { GODS, MATERIALS } from '../../utils/helpers';
import './Home.css';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [premium, setPremium] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feat, best, trend, newest, prem, sett] = await Promise.all([
          productAPI.getAll({ featured: true, limit: 8 }),
          productAPI.getAll({ bestSeller: true, limit: 8 }),
          productAPI.getAll({ trending: true, limit: 8 }),
          productAPI.getAll({ newArrival: true, limit: 8 }),
          productAPI.getAll({ premium: true, limit: 4 }),
          adminAPI.getSettings(),
        ]);
        setFeatured(feat.data.data);
        setBestSellers(best.data.data);
        setTrending(trend.data.data);
        setNewArrivals(newest.data.data);
        setPremium(prem.data.data);
        setSettings(sett.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const heroBanner = settings?.banners?.find((b) => b.type === 'hero' && b.isActive);
  const festivalBanner = settings?.banners?.find((b) => b.type === 'festival' && b.isActive);

  const reviews = [
    { name: 'Priya Sharma', city: 'Mumbai', rating: 5, text: 'Beautiful Ganesha murti! Packaging was excellent and delivery was fast.', image: 'https://i.pravatar.cc/80?img=1' },
    { name: 'Rajesh Kumar', city: 'Delhi', rating: 5, text: 'Authentic brass work. Exactly as shown in pictures. Highly recommended!', image: 'https://i.pravatar.cc/80?img=3' },
    { name: 'Anita Patel', city: 'Ahmedabad', rating: 5, text: 'Premium quality marble Lakshmi idol. Perfect for our home temple.', image: 'https://i.pravatar.cc/80?img=5' },
  ];

  const faqs = [
    { q: 'Are your murtis authentic?', a: 'Yes, all our murtis are 100% authentic, handcrafted by skilled artisans.' },
    { q: 'Do you offer Cash on Delivery?', a: 'Yes, COD is available across India for orders up to ₹25,000.' },
    { q: 'How long does delivery take?', a: 'Standard delivery takes 5-7 business days. Express delivery available in select cities.' },
    { q: 'Can I request a live video?', a: 'Absolutely! Contact us on WhatsApp to request a live video of any product.' },
  ];

  const ProductSection = ({ title, subtitle, products, link, alt }) => (
    <section className={`section ${alt ? 'section-alt' : ''}`}>
      <div className="container">
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">{subtitle}</p>
        {loading ? <div className="loading-spinner" /> : (
          <div className="grid-4">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
        {link && <div className="section-cta"><Link to={link} className="btn btn-outline">View All</Link></div>}
      </div>
    </section>
  );

  return (
    <>
      <SEO schema={{
        '@context': 'https://schema.org',
        '@type': 'Store',
        name: 'Shivam Traders',
        description: 'Premium Hindu God Murtis',
        url: import.meta.env.VITE_SITE_URL,
      }} />

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: `url(${heroBanner?.image?.url || 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=1600&q=80'})` }} />
        <div className="hero-overlay" />
        <div className="container hero-content">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="hero-om">🕉</span>
            <span className="hero-badge">✨ Premium Murti Collection</span>
            <p className="hero-tagline">दिव्य मूर्तियाँ — Divine Idols for Your Home Temple</p>
            <h1>{heroBanner?.title || 'Sacred Murtis Crafted with Devotion'}</h1>
            <p>{heroBanner?.subtitle || 'Handcrafted Hindu God idols in Brass, Marble & Wood. Blessed, packaged with care, delivered across India.'}</p>
            <div className="hero-cta">
              <Link to="/shop" className="btn btn-primary btn-lg">Shop Murtis</Link>
              <Link to="/about" className="btn btn-outline btn-lg">Our Story</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Festival Banner */}
      {festivalBanner && (
        <section className="festival-banner">
          <div className="container">
            <motion.div className="festival-card" whileHover={{ scale: 1.01 }}>
              <img src={festivalBanner.image?.url} alt={festivalBanner.title} />
              <div className="festival-info">
                <h3>{festivalBanner.title}</h3>
                <p>{festivalBanner.subtitle}</p>
                <Link to="/shop" className="btn btn-gold btn-sm">Shop Festival Collection</Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Shop by God */}
      <section className="section shop-by">
        <div className="container">
          <h2 className="section-title">Shop by God</h2>
          <p className="section-subtitle">Find the divine presence you seek</p>
          <div className="god-grid">
            {GODS.map((god, i) => (
              <Link key={god} to={`/shop?god=${god}`} className="god-card">
                <motion.div whileHover={{ y: -4 }} transition={{ delay: i * 0.05 }}>
                  <span className="god-emoji">{['🐘', '🪈', '🔱', '🪷', '🙏', '🦁', '📿', '🏹', '💎', '🔥'][i]}</span>
                  <span>{god}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ProductSection title="Featured Collection" subtitle="श्रेष्ठ संग्रह — Curated divine masterpieces" products={featured} link="/shop?featured=true" alt />
      <ProductSection title="Best Sellers" subtitle="भक्तों की पसंद — Most loved by devotees" products={bestSellers} link="/shop?bestSeller=true" />
      <ProductSection title="Trending Now" subtitle="इस सीज़न के लोकप्रिय — Popular picks" products={trending} link="/shop?trending=true" alt />
      <ProductSection title="New Arrivals" subtitle="नया आगमन — Fresh additions to our collection" products={newArrivals} link="/shop?newArrival=true" />
      <ProductSection title="Premium Collection" subtitle="विशेष संग्रह — Luxury murtis for discerning devotees" products={premium} link="/shop?premium=true" alt />

      {/* Shop by Material */}
      <section className="section materials-section">
        <div className="container">
          <h2 className="section-title">Shop by Material</h2>
          <div className="materials-grid">
            {MATERIALS.map((m) => (
              <Link key={m.value} to={`/shop?material=${m.value}`} className="material-card">
                <h4>{m.label}</h4>
                <span>Explore →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section why-choose">
        <div className="container">
          <h2 className="section-title">Why Choose Shivam Traders</h2>
          <div className="grid-4">
            {[
              { icon: <FiAward />, title: '100% Authentic', desc: 'Genuine handcrafted murtis' },
              { icon: <FiShield />, title: 'Secure Payment', desc: 'Razorpay & COD available' },
              { icon: <FiTruck />, title: 'Fast Delivery', desc: 'Pan India shipping' },
              { icon: <FiStar />, title: 'Premium Quality', desc: 'Artisan-crafted excellence' },
            ].map((item) => (
              <motion.div key={item.title} className="why-card" whileHover={{ y: -4 }}>
                <div className="why-icon">{item.icon}</div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="section reviews-section">
        <div className="container">
          <h2 className="section-title">Customer Reviews</h2>
          <div className="grid-3">
            {reviews.map((r) => (
              <div key={r.name} className="review-card">
                <div className="review-header">
                  <img src={r.image} alt={r.name} />
                  <div>
                    <strong>{r.name}</strong>
                    <span>{r.city}</span>
                  </div>
                  <div className="stars">{'★'.repeat(r.rating)}</div>
                </div>
                <p>"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="section video-section">
        <div className="container">
          <h2 className="section-title">See Our Craftsmanship</h2>
          <div className="video-wrapper">
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Shivam Traders Craftsmanship"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* About */}
      <section className="section about-section">
        <div className="container grid-2">
          <div className="about-image">
            <img src="https://picsum.photos/seed/about/600/700" alt="Shivam Traders artisans" />
          </div>
          <div className="about-content">
            <h2>About Shivam Traders</h2>
            <p>For generations, Shivam Traders has been crafting divine murtis that bring spiritual peace to homes across India. Based in the sacred city of Varanasi, our artisans combine traditional techniques with premium materials.</p>
            <p>Every murti is blessed, carefully packaged, and delivered with the reverence it deserves.</p>
            <Link to="/about" className="btn btn-primary">Learn More</Link>
          </div>
        </div>
      </section>

      {/* Instagram */}
      <section className="section instagram-section">
        <div className="container">
          <h2 className="section-title">Follow Us on Instagram</h2>
          <div className="instagram-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <a key={i} href="#" className="insta-item">
                <img src={`https://picsum.photos/seed/insta${i}/300/300`} alt={`Instagram ${i}`} loading="lazy" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section faq-section">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((f) => (
              <details key={f.q} className="faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
