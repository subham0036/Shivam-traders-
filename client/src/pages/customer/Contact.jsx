import { useState } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import SEO from '../../components/common/SEO';
import { adminAPI } from '../../services';
import { showToast } from '../../components/common/Toast';
import { STORE } from '../../utils/storeInfo';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await adminAPI.submitContact(form);
    showToast('Message sent!');
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <>
      <SEO title="Contact Us" description={`Contact ${STORE.name} — ${STORE.address.full}`} />
      <div className="page-hero">
        <div className="container">
          <span className="om-deco">🕉</span>
          <h1>Contact Us</h1>
          <p>हमसे संपर्क करें — We'd love to hear from you</p>
        </div>
      </div>
      <section className="content-section">
        <div className="container contact-grid">
          <form onSubmit={handleSubmit} className="content-card">
            <h3>Send us a message</h3>
            <div className="form-group"><label>Name</label><input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="grid-2">
              <div className="form-group"><label>Email</label><input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
              <div className="form-group"><label>Phone</label><input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Subject</label><input className="form-control" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required /></div>
            <div className="form-group"><label>Message</label><textarea className="form-control" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required /></div>
            <button className="btn btn-primary btn-lg">Send Message</button>
          </form>

          <div>
            <div className="content-card contact-details-card">
              <h3>Visit our store</h3>
              <div className="contact-info-item">
                <FiMapPin />
                <div>
                  <strong>{STORE.name}</strong>
                  <p>{STORE.address.line2}</p>
                  <p>{STORE.address.line3}</p>
                  <p>PIN — {STORE.address.pincode}</p>
                  {STORE.mapsLink && (
                    <a
                      href={STORE.mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-map-link"
                    >
                      Get directions on Google Maps →
                    </a>
                  )}
                </div>
              </div>
              <a href={`tel:${STORE.phoneTel}`} className="contact-info-item contact-link">
                <FiPhone />
                <span>{STORE.phone}</span>
              </a>
              <a href={`mailto:${STORE.email}`} className="contact-info-item contact-link">
                <FiMail />
                <span>{STORE.email}</span>
              </a>
              <a
                href={`https://wa.me/${STORE.whatsapp}?text=Hi, I have a query about your murtis`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-info-item contact-link"
              >
                <FaWhatsapp />
                <span>WhatsApp: {STORE.phone}</span>
              </a>
              <div className="contact-info-item">
                <FiClock />
                <span>{STORE.hours}</span>
              </div>
            </div>
            {STORE.mapsEmbed && (
              <iframe
                title="Shivam Traders — Jogbani, Araria"
                src={STORE.mapsEmbed}
                className="contact-map"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
