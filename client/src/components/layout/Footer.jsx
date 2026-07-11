import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { adminAPI } from '../../services';
import { useState } from 'react';
import { showToast } from '../common/Toast';
import { STORE } from '../../utils/storeInfo';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletter = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.subscribeNewsletter({ email });
      showToast('Subscribed successfully');
      setEmail('');
    } catch {
      showToast('Subscription failed');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">Shivam Traders</Link>
            <p>
              Premium handcrafted Hindu God murtis from Jogbani, Araria (Bihar). Delivering devotion and craftsmanship across India.
            </p>
            <div className="footer-social">
              {STORE.instagram && (
                <a href={STORE.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer"><FiInstagram /></a>
              )}
              <a href="#" aria-label="Facebook"><FiFacebook /></a>
              <a href="#" aria-label="YouTube"><FiYoutube /></a>
              <a href={`https://wa.me/${STORE.whatsapp}`} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              <li><Link to="/shop">All Murtis</Link></li>
              <li><Link to="/shop?premium=true">Premium Collection</Link></li>
              <li><Link to="/shop?newArrival=true">New Arrivals</Link></li>
              <li><Link to="/shop?bestSeller=true">Best Sellers</Link></li>
              <li><Link to="/about">Our Story</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Policies</h4>
            <ul>
              <li><Link to="/track-order">Track Order</Link></li>
              <li><Link to="/shipping-policy">Shipping</Link></li>
              <li><Link to="/refund-policy">Returns & Exchange</Link></li>
              <li><Link to="/privacy-policy">Privacy</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul className="footer-contact">
              <li>
                <FiMapPin />
                <span>
                  {STORE.address.line1}<br />
                  {STORE.address.line2}<br />
                  {STORE.address.line3} — {STORE.address.pincode}
                  {STORE.mapsLink && (
                    <>
                      <br />
                      <a href={STORE.mapsLink} target="_blank" rel="noopener noreferrer" className="footer-map-link">
                        View on Google Maps
                      </a>
                    </>
                  )}
                </span>
              </li>
              <li>
                <FiPhone />
                <a href={`tel:${STORE.phoneTel}`}>{STORE.phone}</a>
              </li>
              <li>
                <FiMail />
                <a href={`mailto:${STORE.email}`}>{STORE.email}</a>
              </li>
            </ul>
            <form className="footer-newsletter" onSubmit={handleNewsletter}>
              <p className="footer-newsletter-label">Newsletter</p>
              <div className="footer-newsletter-row">
                <input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <button type="submit" className="btn btn-primary btn-sm">Subscribe</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} Shivam Traders. All rights reserved.</p>
          <span>Jogbani, Araria (Bihar) — Made in India</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
