import SEO from '../../components/common/SEO';
import { Link } from 'react-router-dom';

const About = () => (
    <>
      <SEO title="About Us" description="Learn about Shivam Traders - premium Hindu God Murtis from Varanasi" />
      <div className="page-hero">
        <div className="container">
          <span className="om-deco">🕉</span>
          <h1>About Shivam Traders</h1>
          <p>पीढ़ियों से दिव्य मूर्तियाँ — Crafting devotion since generations</p>
        </div>
      </div>
      <div className="container" style={{ padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 24px)', maxWidth: 900 }}>
      <img src="https://picsum.photos/seed/about2/900/400" alt="Shivam Traders" style={{ borderRadius: 16, marginBottom: 32, width: '100%' }} />
      <p style={{ fontSize: 17, lineHeight: 1.8, marginBottom: 20, color: 'var(--text-light)' }}>
        Shivam Traders is a family-owned business rooted in the sacred traditions of Varanasi. For over three generations, we have been crafting and curating the finest Hindu God Murtis for devotees across India.
      </p>
      <p style={{ fontSize: 17, lineHeight: 1.8, marginBottom: 20, color: 'var(--text-light)' }}>
        Every murti in our collection is handcrafted by skilled artisans using premium materials — brass, marble, wood, and more. We believe that a divine idol is not just a product, but a sacred presence that transforms your home into a temple.
      </p>
      <h2 style={{ margin: '32px 0 16px' }}>Our Promise</h2>
      <ul style={{ lineHeight: 2, color: 'var(--text-light)' }}>
        <li>100% authentic, handcrafted murtis</li>
        <li>Premium packaging for safe delivery</li>
        <li>Pan-India shipping with UPI payment</li>
        <li>Dedicated customer support via WhatsApp</li>
      </ul>
      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <Link to="/shop" className="btn btn-primary btn-lg">Explore Collection</Link>
      </div>
    </div>
  </>
);

export default About;
