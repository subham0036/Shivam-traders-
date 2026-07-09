import SEO from '../../components/common/SEO';

const PolicyPage = ({ title, children }) => (
  <>
    <SEO title={title} />
    <div className="container" style={{ padding: '60px 20px', maxWidth: 800 }}>
      <h1 style={{ marginBottom: 32 }}>{title}</h1>
      <div style={{ lineHeight: 1.8, color: 'var(--text-light)' }}>{children}</div>
    </div>
  </>
);

export const PrivacyPolicy = () => (
  <PolicyPage title="Privacy Policy">
    <p>Shivam Traders respects your privacy. We collect only necessary information to process orders and improve your experience.</p>
    <h3 style={{ margin: '24px 0 12px', color: 'var(--text)' }}>Information We Collect</h3>
    <p>Name, email, phone, shipping address, and payment details for order processing.</p>
    <h3 style={{ margin: '24px 0 12px', color: 'var(--text)' }}>Data Security</h3>
    <p>We use industry-standard encryption and never share your data with third parties except for order fulfillment.</p>
  </PolicyPage>
);

export const RefundPolicy = () => (
  <PolicyPage title="Refund Policy">
    <p>We offer hassle-free returns within 7 days of delivery for damaged or defective products.</p>
    <h3 style={{ margin: '24px 0 12px', color: 'var(--text)' }}>Eligible Returns</h3>
    <ul><li>Damaged during shipping</li><li>Defective product</li><li>Wrong item delivered</li></ul>
    <h3 style={{ margin: '24px 0 12px', color: 'var(--text)' }}>Refund Process</h3>
    <p>Contact us on WhatsApp with order number and photos. Refunds processed within 5-7 business days.</p>
  </PolicyPage>
);

export const ShippingPolicy = () => (
  <PolicyPage title="Shipping Policy">
    <p>We ship across India via trusted courier partners.</p>
    <h3 style={{ margin: '24px 0 12px', color: 'var(--text)' }}>Delivery Time</h3>
    <p>Standard delivery: 5-7 business days. Metro cities: 3-5 business days.</p>
    <h3 style={{ margin: '24px 0 12px', color: 'var(--text)' }}>Shipping Charges</h3>
    <p>Free shipping on orders above ₹2,000. Standard charge: ₹99.</p>
  </PolicyPage>
);

export const TermsConditions = () => (
  <PolicyPage title="Terms & Conditions">
    <p>By using Shivam Traders website, you agree to these terms.</p>
    <h3 style={{ margin: '24px 0 12px', color: 'var(--text)' }}>Products</h3>
    <p>All murtis are handcrafted. Slight variations in color and finish are natural and not considered defects.</p>
    <h3 style={{ margin: '24px 0 12px', color: 'var(--text)' }}>Payments</h3>
    <p>We accept online payments via Razorpay and Cash on Delivery (COD) for eligible orders.</p>
  </PolicyPage>
);

export const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '100px 20px' }}>
    <h1 style={{ fontSize: 72, color: 'var(--gold)' }}>404</h1>
    <h2>Page Not Found</h2>
    <p style={{ color: 'var(--text-light)', margin: '16px 0 32px' }}>The page you're looking for doesn't exist.</p>
    <a href="/" className="btn btn-primary">Go Home</a>
  </div>
);
