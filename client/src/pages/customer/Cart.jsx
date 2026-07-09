import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiGift } from 'react-icons/fi';
import SEO from '../../components/common/SEO';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';
import { showToast } from '../../components/common/Toast';
import './Cart.css';

const Cart = () => {
  const { cart, prices, updateQuantity, removeItem, applyCoupon, updateGift, loading } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [giftWrap, setGiftWrap] = useState(cart.giftWrapping || false);
  const [giftMessage, setGiftMessage] = useState(cart.giftMessage || '');

  const handleCoupon = async (e) => {
    e.preventDefault();
    try {
      await applyCoupon(couponCode);
      showToast('Coupon applied!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const handleGift = async (checked) => {
    setGiftWrap(checked);
    await updateGift(checked, giftMessage);
  };

  const freeShippingThreshold = 2000;
  const subtotal = prices.itemsPrice || 0;
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  if (loading) return <div className="loading-spinner" />;

  return (
    <>
      <SEO title="Shopping Cart" />
      <div className="cart-page">
        <div className="container">
          <h1>Shopping Cart</h1>

          {cart.items?.length === 0 ? (
            <div className="empty-cart">
              <h3>Your cart is empty</h3>
              <p>Discover our divine collection</p>
              <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items">
                {subtotal < freeShippingThreshold && (
                  <div className="shipping-progress">
                    <p>Add {formatPrice(freeShippingThreshold - subtotal)} more for FREE shipping!</p>
                    <div className="progress-bar"><div style={{ width: `${shippingProgress}%` }} /></div>
                  </div>
                )}

                {cart.items.map((item) => (
                  <div key={item.product._id} className="cart-item">
                    <img src={item.product.images?.[0]?.url} alt={item.product.name} />
                    <div className="item-info">
                      <Link to={`/product/${item.product.slug}`}><h3>{item.product.name}</h3></Link>
                      <p>{formatPrice(item.product.sellingPrice)}</p>
                    </div>
                    <div className="qty-selector">
                      <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>+</button>
                    </div>
                    <span className="item-total">{formatPrice(item.product.sellingPrice * item.quantity)}</span>
                    <button className="remove-btn" onClick={() => removeItem(item.product._id)}><FiTrash2 /></button>
                  </div>
                ))}

                <div className="cart-extras">
                  <form onSubmit={handleCoupon} className="coupon-form">
                    <input className="form-control" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                    <button className="btn btn-outline btn-sm">Apply</button>
                  </form>
                  <label className="gift-wrap">
                    <input type="checkbox" checked={giftWrap} onChange={(e) => handleGift(e.target.checked)} />
                    <FiGift /> Gift Wrapping (+₹50)
                  </label>
                  {giftWrap && (
                    <input className="form-control" placeholder="Gift message (optional)" value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} onBlur={() => updateGift(true, giftMessage)} />
                  )}
                </div>
              </div>

              <div className="order-summary">
                <h3>Order Summary</h3>
                <div className="summary-row"><span>Subtotal</span><span>{formatPrice(prices.itemsPrice)}</span></div>
                {prices.couponDiscount > 0 && <div className="summary-row discount"><span>Coupon Discount</span><span>-{formatPrice(prices.couponDiscount)}</span></div>}
                <div className="summary-row"><span>Shipping</span><span>{prices.shippingPrice === 0 ? 'FREE' : formatPrice(prices.shippingPrice)}</span></div>
                <div className="summary-row"><span>GST (18%)</span><span>{formatPrice(prices.taxPrice)}</span></div>
                {prices.giftWrappingCharge > 0 && <div className="summary-row"><span>Gift Wrapping</span><span>{formatPrice(prices.giftWrappingCharge)}</span></div>}
                <div className="summary-row total"><span>Total</span><span>{formatPrice(prices.totalPrice)}</span></div>
                <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 20 }}>Proceed to Checkout</Link>
                <Link to="/shop" className="continue-link">← Continue Shopping</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
