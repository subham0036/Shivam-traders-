import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import SEO from '../../components/common/SEO';
import { orderAPI } from '../../services';
import { formatPrice } from '../../utils/helpers';

const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    orderAPI.track(orderNumber).then(({ data }) => setOrder(data.data));
  }, [orderNumber]);

  return (
    <>
      <SEO title="Order Confirmed" />
      <div className="order-success-page">
        <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <FiCheckCircle style={{ fontSize: 64, color: '#27ae60', marginBottom: 20 }} />
          <h1>Order Placed Successfully!</h1>
          <p style={{ color: 'var(--text-light)', margin: '12px 0 32px' }}>
            Thank you for your order. A confirmation email has been sent.
          </p>
          {order && (
            <div style={{ background: 'var(--white)', padding: 32, borderRadius: 16, maxWidth: 500, margin: '0 auto 32px', boxShadow: 'var(--shadow)' }}>
              <p><strong>Order Number:</strong> {order.orderNumber}</p>
              <p><strong>Total:</strong> {formatPrice(order.totalPrice)}</p>
              <p><strong>Payment:</strong> {order.paymentMethod.toUpperCase()}</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/track-order?order=${orderNumber}`} className="btn btn-outline">Track Order</Link>
            <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccess;
