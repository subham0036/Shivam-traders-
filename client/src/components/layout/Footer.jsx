import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { adminAPI } from '../../services';
import { useState } from 'react';
import { showToast } from '../common/Toast';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletter = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.subscribeNewsletter({ email });
      showToast('Subscribed successfully!');
      setEmail('');
    } catch {
      showToast('Subscription failed');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container grid-4">
          <div className="footer-brand">
            <h3>🕉 Shivam Traders</h3>
            <p>Premium handcrafted Hindu God Murtis. Bringing divine blessings to homes across India since generations.</p>
            <div className="footer-social">
              <a href="#" aria-label="Instagram"><FiInstagram /></a>
              <a href="#" aria-label="Facebook"><FiFacebook /></a>
              <a href="#" aria-label="YouTube"><FiYoutube /></a>
              <a href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210'}`} aria-label="WhatsApp"><FaWhatsapp /></a>
            </div>
          </div>

          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/shop">Shop All</Link></li>
              <li><Link to="/shop?premium=true">Premium Collection</Link></li>
              <li><Link to="/shop?newArrival=true">New Arrivals</Link></li>
              <li><Link to="/shop?bestSeller=true">Best Sellers</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4>Customer Service</h4>
            <ul>
              <li><Link to="/track-order">Track Order</Link></li>
              <li><Link to="/shipping-policy">Shipping Policy</Link></li>
              <li><Link to="/refund-policy">Refund Policy</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h4>Contact Us</h4>
            <ul className="footer-contact">
              <li><FiMapPin /> Varanasi, Uttar Pradesh, India</li>
              <li><FiPhone /> {import.meta.env.VITE_PHONE_NUMBER || '+91 9876543210'}</li>
              <li><FiMail /> info@shivamtraders.com</li>
            </ul>
            <form className="newsletter-form" onSubmit={handleNewsletter}>
              <input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button type="submit" className="btn btn-primary btn-sm">Subscribe</button>
            </form>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} Shivam Traders. All rights reserved. Made with 🙏 in India</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
