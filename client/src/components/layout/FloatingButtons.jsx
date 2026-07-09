import { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiPhone, FiArrowUp } from 'react-icons/fi';
import './FloatingButtons.css';

const FloatingButtons = () => {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="floating-buttons">
      <a
        href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210'}?text=Hi, I'm interested in your murtis`}
        className="float-btn whatsapp"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <FaWhatsapp />
      </a>
      <a href={`tel:${import.meta.env.VITE_PHONE_NUMBER || '+919876543210'}`} className="float-btn call" aria-label="Call">
        <FiPhone />
      </a>
      {showTop && (
        <button className="float-btn top" onClick={scrollTop} aria-label="Back to top">
          <FiArrowUp />
        </button>
      )}
    </div>
  );
};

export default FloatingButtons;
