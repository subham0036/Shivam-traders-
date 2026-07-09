import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import { orderAPI } from '../../services';
import { formatPrice, ORDER_STATUS } from '../../utils/helpers';

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    try {
      const { data } = await orderAPI.track(orderNumber);
      setOrder(data.data);
      setError('');
    } catch {
      setError('Order not found');
      setOrder(null);
    }
  };

  const statuses = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];

  return (
    <>
      <SEO title="Track Order" />
      <div className="container" style={{ padding: '60px 20px', maxWidth: 700 }}>
        <h1 style={{ textAlign: 'center', marginBottom: 32 }}>Track Your Order</h1>
        <form onSubmit={handleTrack} style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
          <input className="form-control" placeholder="Enter order number (e.g. ST202601123456)" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} required />
          <button className="btn btn-primary">Track</button>
        </form>
        {error && <p style={{ color: '#e74c3c', textAlign: 'center' }}>{error}</p>}
        {order && (
          <div style={{ background: 'var(--white)', padding: 32, borderRadius: 16, boxShadow: 'var(--shadow)' }}>
            <h3>Order {order.orderNumber}</h3>
            <p>Status: <strong>{ORDER_STATUS[order.status]}</strong></p>
            <p>Total: {formatPrice(order.totalPrice)}</p>
            {order.trackingNumber && <p>Tracking: {order.trackingNumber}</p>}
            <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
              {statuses.map((s) => (
                <div key={s} style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: statuses.indexOf(s) <= statuses.indexOf(order.status) ? 'var(--saffron)' : 'var(--border)',
                  color: statuses.indexOf(s) <= statuses.indexOf(order.status) ? 'white' : 'var(--text-light)',
                }}>
                  {ORDER_STATUS[s]}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TrackOrder;
