import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../../services';
import { formatPrice } from '../../../utils/helpers';
import { resolveMediaUrl } from '../../../utils/invoice';

const Payments = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    orderAPI.getAll({ paymentStatus: 'pending', paymentMethod: 'upi', limit: 50 })
      .then(({ data }) => setOrders(data.data));
  }, []);

  return (
    <div>
      <div className="admin-page-header">
        <h1>Payment Verification</h1>
        <p>Manual UPI orders awaiting admin approval</p>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>UPI TXN</th><th>Screenshot</th><th></th></tr></thead>
          <tbody>
            {orders.length === 0 ? <tr><td colSpan={6}>No pending UPI payments</td></tr> : orders.map((o) => (
              <tr key={o._id}>
                <td>{o.orderNumber}</td>
                <td>{o.user?.name || o.guestEmail}</td>
                <td>{formatPrice(o.totalPrice)}</td>
                <td>{o.upiTransactionId || '—'}</td>
                <td>{o.paymentScreenshot?.url ? <a href={resolveMediaUrl(o.paymentScreenshot.url)} target="_blank" rel="noreferrer">View</a> : '—'}</td>
                <td><Link to={`/admin/orders/${o._id}`} state={{ order: o }} className="btn btn-sm btn-primary">Verify</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
