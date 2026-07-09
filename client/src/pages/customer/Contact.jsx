import { useState } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import SEO from '../../components/common/SEO';
import { adminAPI } from '../../services';
import { showToast } from '../../components/common/Toast';

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
      <SEO title="Contact Us" />
      <div className="container" style={{ padding: '60px 20px' }}>
        <h1 className="section-title">Contact Us</h1>
        <p className="section-subtitle">We'd love to hear from you</p>
        <div className="grid-2" style={{ gap: 48, alignItems: 'start' }}>
          <form onSubmit={handleSubmit} style={{ background: 'white', padding: 32, borderRadius: 16, boxShadow: 'var(--shadow)' }}>
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
            <div style={{ background: 'white', padding: 32, borderRadius: 16, boxShadow: 'var(--shadow)', marginBottom: 24 }}>
              {[
                { icon: <FiMapPin />, text: 'Varanasi, Uttar Pradesh, India' },
                { icon: <FiPhone />, text: import.meta.env.VITE_PHONE_NUMBER || '+91 9876543210' },
                { icon: <FiMail />, text: 'info@shivamtraders.com' },
                { icon: <FaWhatsapp />, text: 'WhatsApp Support Available' },
                { icon: <FiClock />, text: 'Mon-Sat: 9AM - 8PM' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, fontSize: 15 }}>
                  <span style={{ color: 'var(--saffron)', fontSize: 20 }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
            <iframe
              title="Shivam Traders Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3600!2d82.9739!3d25.3176!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDE5JzAzLjQiTiA4MsKwNTgnMjYuMCJF!5e0!3m2!1sen!2sin!4v1"
              width="100%"
              height="300"
              style={{ border: 0, borderRadius: 16 }}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
