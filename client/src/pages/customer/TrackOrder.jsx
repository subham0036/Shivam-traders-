import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import { orderAPI } from '../../services';
import { formatPrice, ORDER_STATUS, ORDER_TIMELINE } from '../../utils/helpers';
import './TrackOrder.css';

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const num = searchParams.get('order');
    if (num) {
      orderAPI.track(num).then(({ data }) => { setOrder(data.data); setError(''); }).catch(() => setError('Order not found'));
    }
  }, [searchParams]);

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

  const currentIdx = order ? ORDER_TIMELINE.indexOf(order.status) : -1;

  return (
    <>
      <SEO title="Track Order" />
      <div className="track-page">
        <div className="container track-inner">
          <h1>Track Your Order</h1>
          <form onSubmit={handleTrack} className="track-form">
            <input className="form-control" placeholder="Enter order number (e.g. ST202601123456)" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} required />
            <button className="btn btn-primary">Track</button>
          </form>
          {error && <p className="track-error">{error}</p>}
          {order && (
            <div className="track-card">
              <div className="track-header">
                <div>
                  <h2>{order.orderNumber}</h2>
                  <p>{ORDER_STATUS[order.status] || order.status}</p>
                </div>
                <div className="track-total">{formatPrice(order.totalPrice)}</div>
              </div>

              <div className="track-meta">
                <span>Payment: <strong>{order.paymentStatus}</strong></span>
                <span>Method: {order.paymentMethod?.toUpperCase()}</span>
                {order.courierName && <span>Courier: {order.courierName}</span>}
                {order.trackingNumber && <span>Tracking: <strong>{order.trackingNumber}</strong></span>}
                {order.estimatedDelivery && <span>Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}</span>}
              </div>

              <div className="track-timeline">
                {ORDER_TIMELINE.map((s, i) => (
                  <div key={s} className={`track-step ${i <= currentIdx ? 'done' : ''} ${order.status === s ? 'current' : ''}`}>
                    <div className="track-dot" />
                    <span>{ORDER_STATUS[s]}</span>
                  </div>
                ))}
              </div>

              <div className="track-items">
                <h3>Items</h3>
                {order.items?.map((item, i) => (
                  <div key={i} className="track-item-row">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TrackOrder;
