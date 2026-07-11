import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { orderAPI } from '../../../services';
import { formatPrice, ORDER_STATUS } from '../../../utils/helpers';

const Orders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    paymentStatus: searchParams.get('paymentStatus') || '',
  });

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const { data } = await orderAPI.getAll(params);
      setOrders(data.data);
      setPagination(data.pagination || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [searchParams]);

  const applyFilters = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (filters.search) p.set('search', filters.search);
    if (filters.status) p.set('status', filters.status);
    if (filters.paymentStatus) p.set('paymentStatus', filters.paymentStatus);
    setSearchParams(p);
    load(1);
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Orders</h1>
      </div>

      <form className="admin-filters" onSubmit={applyFilters}>
        <input className="form-control" placeholder="Order ID, email, phone..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <select className="form-control" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="form-control" value={filters.paymentStatus} onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}>
          <option value="">All payments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <button className="btn btn-primary btn-sm">Filter</button>
      </form>

      {loading ? <div className="loading-spinner" /> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th><th>Customer</th><th>Phone</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th><th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td><strong>{o.orderNumber}</strong></td>
                  <td>{o.user?.name || o.shippingAddress?.fullName || o.guestEmail || 'Guest'}</td>
                  <td>{o.shippingAddress?.phone || o.guestPhone || '—'}</td>
                  <td>{formatPrice(o.totalPrice)}</td>
                  <td><span className="badge badge-saffron">{ORDER_STATUS[o.status] || o.status}</span></td>
                  <td><span className={`badge ${o.paymentStatus === 'paid' ? 'badge-success' : 'badge-warn'}`}>{o.paymentStatus}</span></td>
                  <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                  <td><Link to={`/admin/orders/${o._id}`} state={{ order: o }} className="btn btn-sm btn-outline">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="admin-pagination">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button key={p} className={p === pagination.page ? 'active' : ''} onClick={() => load(p)}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
