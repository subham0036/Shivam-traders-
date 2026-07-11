import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import UpiPaymentBox, { UPI_DEFAULTS } from '../../components/common/UpiPaymentBox';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, adminAPI } from '../../services';
import { formatPrice, loadRazorpay } from '../../utils/helpers';
import { showToast } from '../../components/common/Toast';
import './Checkout.css';

const Checkout = () => {
  const { cart, prices } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [upiSettings, setUpiSettings] = useState(null);

  useEffect(() => {
    adminAPI.getSettings().then(({ data }) => setUpiSettings(data.data)).catch(() => {});
  }, []);
  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    deliveryInstructions: '',
    guestEmail: '',
    guestPhone: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cart.items?.length) return showToast('Cart is empty');

    setLoading(true);
    try {
      const orderData = {
        items: cart.items.map((i) => ({ product: i.product._id, quantity: i.quantity })),
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        deliveryInstructions: form.deliveryInstructions,
        paymentMethod,
        guestEmail: !user ? form.guestEmail : undefined,
        guestPhone: !user ? form.guestPhone : undefined,
        giftWrapping: cart.giftWrapping,
        giftMessage: cart.giftMessage,
        couponCode: cart.coupon?.code,
      };

      const { data } = await orderAPI.create(orderData);
      const order = data.data.order || data.data;

      if (paymentMethod === 'razorpay' && data.data.razorpayOrderId) {
        const loaded = await loadRazorpay();
        if (!loaded) throw new Error('Razorpay failed to load');

        const options = {
          key: data.data.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: data.data.amount,
          currency: 'INR',
          name: 'Shivam Traders',
          description: `Order ${order.orderNumber}`,
          order_id: data.data.razorpayOrderId,
          handler: async (response) => {
            await orderAPI.verifyPayment({
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            navigate(`/order-success/${order.orderNumber}`);
          },
          prefill: { name: form.fullName, email: form.email || form.guestEmail, contact: form.phone },
          theme: { color: '#FF9933' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        navigate(`/order-success/${order.orderNumber}`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Checkout" />
      <div className="page-hero">
        <div className="container">
          <span className="om-deco">🕉</span>
          <h1>Checkout</h1>
          <p>अपने घर मंदिर के लिए ऑर्डर पूर्ण करें</p>
        </div>
      </div>
      <div className="checkout-page">
        <div className="container">
          <form onSubmit={handleSubmit} className="checkout-layout">
            <div className="checkout-form">
              {!user && (
                <section className="checkout-section">
                  <h3>Guest Checkout</h3>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Email *</label>
                      <input className="form-control" name="guestEmail" type="email" value={form.guestEmail} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Phone *</label>
                      <input className="form-control" name="guestPhone" value={form.guestPhone} onChange={handleChange} required />
                    </div>
                  </div>
                </section>
              )}

              <section className="checkout-section">
                <h3>Shipping Address</h3>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input className="form-control" name="fullName" value={form.fullName} onChange={handleChange} required />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label>Phone *</label>
                    <input className="form-control" name="phone" value={form.phone} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input className="form-control" name="email" type="email" value={form.email} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Address Line 1 *</label>
                  <input className="form-control" name="addressLine1" value={form.addressLine1} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Address Line 2</label>
                  <input className="form-control" name="addressLine2" value={form.addressLine2} onChange={handleChange} />
                </div>
                <div className="grid-3">
                  <div className="form-group">
                    <label>City *</label>
                    <input className="form-control" name="city" value={form.city} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input className="form-control" name="state" value={form.state} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Pincode *</label>
                    <input className="form-control" name="pincode" value={form.pincode} onChange={handleChange} required maxLength={6} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Delivery Instructions</label>
                  <textarea className="form-control" name="deliveryInstructions" value={form.deliveryInstructions} onChange={handleChange} rows={3} />
                </div>
              </section>

              <section className="checkout-section">
                <h3>Payment Method</h3>
                <div className="payment-options">
                  {[
                    { value: 'upi', label: 'Manual UPI (Pay & Upload Screenshot)' },
                    { value: 'razorpay', label: 'Online Payment (Razorpay)' },
                    { value: 'cod', label: 'Cash on Delivery' },
                  ].map((opt) => (
                    <label key={opt.value} className={`payment-option ${paymentMethod === opt.value ? 'active' : ''}`}>
                      <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} />
                      {opt.label}
                    </label>
                  ))}
                </div>

                {paymentMethod === 'upi' && (
                  <UpiPaymentBox
                    amount={prices.totalPrice}
                    upiId={upiSettings?.payment?.upiId || UPI_DEFAULTS.upiId}
                    upiName={upiSettings?.payment?.upiName || UPI_DEFAULTS.upiName}
                    orderNote="Shivam Traders Order"
                    compact
                  />
                )}
              </section>
            </div>

            <div className="checkout-summary">
              <h3>Order Summary</h3>
              {cart.items?.map((item) => (
                <div key={item.product._id} className="summary-item">
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>{formatPrice(item.product.sellingPrice * item.quantity)}</span>
                </div>
              ))}
              <div className="summary-row"><span>Subtotal</span><span>{formatPrice(prices.itemsPrice)}</span></div>
              <div className="summary-row"><span>Shipping</span><span>{prices.shippingPrice === 0 ? 'FREE' : formatPrice(prices.shippingPrice)}</span></div>
              <div className="summary-row"><span>GST</span><span>{formatPrice(prices.taxPrice)}</span></div>
              <div className="summary-row total"><span>Total</span><span>{formatPrice(prices.totalPrice)}</span></div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 20 }} disabled={loading}>
                {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order (COD)' : paymentMethod === 'upi' ? 'Place Order — Pay on Next Step' : 'Pay Now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Checkout;
