import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiX } from 'react-icons/fi';
import { orderAPI } from '../../../services';
import { formatPrice } from '../../../utils/helpers';
import './AdminOrderNotifier.css';

const POLL_MS = 30000;

const AdminOrderNotifier = ({ onCountChange }) => {
  const [alerts, setAlerts] = useState([]);
  const seenRef = useRef(new Set());
  const initRef = useRef(false);

  useEffect(() => {
    const poll = async () => {
      try {
        const { data } = await orderAPI.getAll({ limit: 20, page: 1 });
        const orders = data.data || [];

        if (!initRef.current) {
          orders.forEach((o) => seenRef.current.add(o._id));
          initRef.current = true;
          return;
        }

        const fresh = orders
          .filter((o) => !seenRef.current.has(o._id))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        fresh.forEach((o) => seenRef.current.add(o._id));

        if (fresh.length) {
          setAlerts((prev) => [
            ...fresh.map((o) => ({
              id: o._id,
              orderNumber: o.orderNumber,
              total: o.totalPrice,
              customer: o.user?.name || o.shippingAddress?.fullName || o.guestEmail || 'Guest',
              method: o.paymentMethod,
              at: Date.now(),
            })),
            ...prev,
          ].slice(0, 6));
        }
      } catch {
        /* ignore poll errors */
      }
    };

    poll();
    const timer = setInterval(poll, POLL_MS);
    return () => clearInterval(timer);
  }, []);

  const dismiss = (id) => setAlerts((prev) => prev.filter((a) => a.id !== id));
  const dismissAll = () => setAlerts([]);

  useEffect(() => {
    onCountChange?.(alerts.length);
  }, [alerts.length, onCountChange]);

  return (
    <>
      {alerts.length > 0 && (
        <div className="admin-order-alerts">
          <div className="admin-order-alerts-header">
            <span><FiBell /> {alerts.length} new order{alerts.length > 1 ? 's' : ''}</span>
            <button type="button" onClick={dismissAll}>Dismiss all</button>
          </div>
          {alerts.map((a) => (
            <div key={`${a.id}-${a.at}`} className="admin-order-alert">
              <button type="button" className="admin-order-alert-close" onClick={() => dismiss(a.id)} aria-label="Dismiss">
                <FiX />
              </button>
              <p className="admin-order-alert-title">🛎️ New Order Received!</p>
              <p className="admin-order-alert-id"><strong>{a.orderNumber}</strong></p>
              <p className="admin-order-alert-meta">
                {a.customer} · {formatPrice(a.total)} · {a.method?.toUpperCase()}
              </p>
              <Link to={`/admin/orders/${a.id}`} className="admin-order-alert-btn" onClick={() => dismiss(a.id)}>
                View Order →
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default AdminOrderNotifier;
