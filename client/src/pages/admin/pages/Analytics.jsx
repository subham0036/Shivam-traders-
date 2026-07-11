import { useEffect, useState } from 'react';
import { adminAPI } from '../../../services';
import { formatPrice } from '../../../utils/helpers';

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminAPI.getAnalytics().then(({ data: res }) => setData(res.data));
  }, []);

  if (!data) return <div className="loading-spinner" />;

  return (
    <div>
      <div className="admin-page-header"><h1>Analytics</h1></div>
      <div className="admin-stat-grid">
        <div className="admin-stat-card"><span>Paid Orders</span><strong>{data.paidOrders}</strong></div>
        <div className="admin-stat-card"><span>Total Orders</span><strong>{data.totalOrders}</strong></div>
        <div className="admin-stat-card"><span>Conversion</span><strong>{data.conversionRate}%</strong></div>
        <div className="admin-stat-card"><span>Avg Order Value</span><strong>{formatPrice(data.avgOrderValue)}</strong></div>
      </div>
      <div className="admin-card">
        <h3>Top Customers</h3>
        {data.topCustomers?.map((c) => (
          <div key={c._id} className="admin-list-row static">
            <span>{c.user?.name}</span>
            <span>{formatPrice(c.total)} ({c.orders} orders)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
