import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../../services';
import { formatPrice, ORDER_STATUS } from '../../../utils/helpers';

const Shipping = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    orderAPI.getAll({ status: 'confirmed', paymentStatus: 'paid', limit: 50 })
      .then(({ data }) => setOrders(data.data));
  }, []);

  return (
    <div>
      <div className="admin-page-header">
        <h1>Shipping</h1>
        <p>Orders ready to pack and ship</p>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Order</th><th>Customer</th><th>City</th><th>Total</th><th>Status</th><th>Tracking</th><th></th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o.orderNumber}</td>
                <td>{o.shippingAddress?.fullName}</td>
                <td>{o.shippingAddress?.city}</td>
                <td>{formatPrice(o.totalPrice)}</td>
                <td>{ORDER_STATUS[o.status]}</td>
                <td>{o.trackingNumber || '—'}</td>
                <td><Link to={`/admin/orders/${o._id}`} state={{ order: o }} className="btn btn-sm btn-outline">Manage</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Shipping;
