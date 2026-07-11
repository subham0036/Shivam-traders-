import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../../services';
import { formatPrice } from '../../../utils/helpers';

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(({ data }) => setStats(data.data))
      .catch(() => setStats({ staffView: true }));
  }, []);

  if (!stats) return <div className="loading-spinner" />;

  if (stats.staffView) {
    return (
      <div>
        <div className="admin-page-header">
          <h1>Staff Panel</h1>
          <p>Manage orders, payments, and shipping</p>
        </div>
        <div className="admin-grid-2">
          <Link to="/admin/orders" className="admin-card" style={{ textAlign: 'center', padding: 40 }}>Orders →</Link>
          <Link to="/admin/payments" className="admin-card" style={{ textAlign: 'center', padding: 40 }}>Payments →</Link>
          <Link to="/admin/shipping" className="admin-card" style={{ textAlign: 'center', padding: 40 }}>Shipping →</Link>
          <Link to="/admin/inventory" className="admin-card" style={{ textAlign: 'center', padding: 40 }}>Inventory →</Link>
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Today's Orders", value: stats.todayOrderCount },
    { label: 'Revenue Today', value: formatPrice(stats.todaySales) },
    { label: 'Monthly Revenue', value: formatPrice(stats.monthRevenue) },
    { label: 'Pending Orders', value: stats.pendingOrders },
    { label: 'Pending Payments', value: stats.pendingPayments, alert: true },
    { label: 'Packing', value: stats.packingOrders },
    { label: 'Shipped', value: stats.shippedOrders },
    { label: 'Delivered', value: stats.deliveredOrders },
    { label: 'Cancelled', value: stats.cancelledOrders },
    { label: 'Total Customers', value: stats.totalCustomers },
    { label: 'Total Products', value: stats.totalProducts },
    { label: 'Low Stock', value: stats.lowStock?.length || 0, alert: (stats.lowStock?.length || 0) > 0 },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Overview of your store performance</p>
      </div>

      <div className="admin-stat-grid">
        {cards.map((c) => (
          <div key={c.label} className={`admin-stat-card ${c.alert ? 'alert' : ''}`}>
            <span>{c.label}</span>
            <strong>{c.value}</strong>
          </div>
        ))}
      </div>

      <div className="admin-grid-2">
        <div className="admin-card">
          <h3>Recent Orders</h3>
          {stats.recentOrders?.map((o) => (
            <Link key={o._id} to={`/admin/orders/${o._id}`} state={{ order: o }} className="admin-list-row">
              <span>{o.orderNumber}</span>
              <span>{formatPrice(o.totalPrice)}</span>
              <span className="badge">{o.status}</span>
            </Link>
          ))}
          <Link to="/admin/orders" className="admin-card-link">View all orders →</Link>
        </div>

        <div className="admin-card">
          <h3>Top Selling Products</h3>
          {stats.topProducts?.map((p) => (
            <div key={p._id} className="admin-list-row static">
              <span>{p.name}</span>
              <span>{p.soldCount} sold</span>
            </div>
          ))}
        </div>

        <div className="admin-card">
          <h3>Low Stock Alerts</h3>
          {stats.lowStock?.length === 0 ? <p className="muted">All stock levels OK</p> : stats.lowStock?.map((i) => (
            <div key={i._id} className="admin-list-row static alert-text">
              <span>{i.product?.name}</span>
              <span>{i.currentStock} left</span>
            </div>
          ))}
        </div>

        <div className="admin-card">
          <h3>Monthly Sales</h3>
          <div className="admin-bar-chart">
            {stats.salesByMonth?.map((m) => (
              <div key={m._id} className="admin-bar" title={`Month ${m._id}`}>
                <div className="admin-bar-fill" style={{ height: `${Math.min(100, (m.revenue / (stats.monthRevenue || 1)) * 100)}%` }} />
                <small>M{m._id}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
