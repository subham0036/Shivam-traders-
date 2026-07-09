import { useEffect, useState } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, productAPI, orderAPI } from '../../services';
import { formatPrice, ORDER_STATUS } from '../../utils/helpers';
import { showToast } from '../../components/common/Toast';
import './Admin.css';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const links = [
    { to: '/admin', label: 'Dashboard', adminOnly: false },
    { to: '/admin/orders', label: 'Orders', adminOnly: false },
    { to: '/admin/products', label: 'Products', adminOnly: false },
    { to: '/admin/inventory', label: 'Inventory', adminOnly: false },
    { to: '/admin/customers', label: 'Customers', adminOnly: false },
    { to: '/admin/coupons', label: 'Coupons', adminOnly: true },
  ].filter((l) => !l.adminOnly || isAdmin);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>🕉</span>
          <div>
            <strong>Shivam Traders</strong>
            <small>{isAdmin ? 'Admin' : 'Staff'} Panel</small>
          </div>
        </div>
        <nav>
          {links.map((l) => (
            <Link key={l.to} to={l.to} end={l.to === '/admin'}>{l.label}</Link>
          ))}
        </nav>
        <button onClick={() => { logout(); navigate('/'); }} className="admin-logout">Logout</button>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) adminAPI.getDashboard().then(({ data }) => setStats(data.data));
  }, [isAdmin]);

  if (!isAdmin) return (
    <div>
      <h1>Staff Dashboard</h1>
      <p>Welcome, {user?.name}. Use the sidebar to manage orders and inventory.</p>
      <div className="staff-cards">
        <Link to="/admin/orders" className="staff-card">Manage Orders</Link>
        <Link to="/admin/inventory" className="staff-card">Manage Inventory</Link>
        <Link to="/admin/products" className="staff-card">View Products</Link>
      </div>
    </div>
  );

  if (!stats) return <div className="loading-spinner" />;

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stat-grid">
        {[
          { label: "Today's Sales", value: formatPrice(stats.todaySales) },
          { label: 'Monthly Revenue', value: formatPrice(stats.monthRevenue) },
          { label: 'Total Revenue', value: formatPrice(stats.totalRevenue) },
          { label: 'Customers', value: stats.totalCustomers },
          { label: 'Products', value: stats.totalProducts },
          { label: 'Pending Orders', value: stats.pendingOrders },
          { label: 'Delivered', value: stats.deliveredOrders },
          { label: 'Cancelled', value: stats.cancelledOrders },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <span>{s.label}</span>
            <strong>{s.value}</strong>
          </div>
        ))}
      </div>

      <div className="admin-grid-2">
        <div className="admin-card">
          <h3>Top Selling Products</h3>
          {stats.topProducts?.map((p) => (
            <div key={p._id} className="list-item">
              <span>{p.name}</span>
              <span>{p.soldCount} sold</span>
            </div>
          ))}
        </div>
        <div className="admin-card">
          <h3>Low Stock Alerts</h3>
          {stats.lowStock?.length === 0 ? <p>All stock levels OK</p> : stats.lowStock?.map((i) => (
            <div key={i._id} className="list-item alert">
              <span>{i.product?.name}</span>
              <span>{i.currentStock} left</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  useEffect(() => { orderAPI.getAll().then(({ data }) => setOrders(data.data)); }, []);

  const updateStatus = async (id, status) => {
    await orderAPI.updateStatus(id, { status });
    showToast('Status updated');
    const { data } = await orderAPI.getAll();
    setOrders(data.data);
  };

  return (
    <div>
      <h1>Orders</h1>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Payment</th><th>Action</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o.orderNumber}</td>
                <td>{o.user?.name || o.guestEmail || 'Guest'}</td>
                <td>{formatPrice(o.totalPrice)}</td>
                <td><span className="badge badge-saffron">{ORDER_STATUS[o.status]}</span></td>
                <td>{o.paymentStatus}</td>
                <td>
                  <select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
                    {Object.keys(ORDER_STATUS).map((s) => <option key={s} value={s}>{ORDER_STATUS[s]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => { productAPI.adminGetAll().then(({ data }) => setProducts(data.data)); }, []);

  const handleDelete = async (id) => {
    if (!isAdmin) return showToast('Staff cannot delete products');
    if (!confirm('Delete this product?')) return;
    await productAPI.delete(id);
    showToast('Deleted');
    const { data } = await productAPI.adminGetAll();
    setProducts(data.data);
  };

  const handleDuplicate = async (id) => {
    if (!isAdmin) return;
    await productAPI.duplicate(id);
    showToast('Product duplicated');
    const { data } = await productAPI.adminGetAll();
    setProducts(data.data);
  };

  return (
    <div>
      <h1>Products {isAdmin && <button className="btn btn-primary btn-sm" style={{ marginLeft: 16 }}>+ Add Product</button>}</h1>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>{formatPrice(p.sellingPrice)}</td>
                <td>{p.stock}</td>
                <td>{p.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  {isAdmin && <button className="btn btn-sm btn-outline" onClick={() => handleDuplicate(p._id)}>Duplicate</button>}
                  {isAdmin && <button className="btn btn-sm" style={{ color: '#e74c3c', marginLeft: 8 }} onClick={() => handleDelete(p._id)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [stockForm, setStockForm] = useState({ productId: '', quantity: '', reason: '' });

  useEffect(() => { adminAPI.getInventory().then(({ data }) => setInventory(data.data)); }, []);

  const stockIn = async (e) => {
    e.preventDefault();
    await adminAPI.stockIn({ productId: stockForm.productId, quantity: +stockForm.quantity, reason: stockForm.reason });
    showToast('Stock added');
    const { data } = await adminAPI.getInventory();
    setInventory(data.data);
  };

  return (
    <div>
      <h1>Inventory</h1>
      <form onSubmit={stockIn} className="admin-form-inline">
        <select className="form-control" value={stockForm.productId} onChange={(e) => setStockForm({ ...stockForm, productId: e.target.value })} required>
          <option value="">Select Product</option>
          {inventory.map((i) => <option key={i._id} value={i.product?._id}>{i.product?.name}</option>)}
        </select>
        <input className="form-control" type="number" placeholder="Quantity" value={stockForm.quantity} onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })} required />
        <input className="form-control" placeholder="Reason" value={stockForm.reason} onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })} />
        <button className="btn btn-primary btn-sm">Stock In</button>
      </form>
      <div className="admin-table-wrap" style={{ marginTop: 24 }}>
        <table className="admin-table">
          <thead><tr><th>Product</th><th>SKU</th><th>Current Stock</th><th>Last Updated</th></tr></thead>
          <tbody>
            {inventory.map((i) => (
              <tr key={i._id} className={i.currentStock <= 5 ? 'low-stock' : ''}>
                <td>{i.product?.name}</td>
                <td>{i.product?.sku}</td>
                <td>{i.currentStock}</td>
                <td>{new Date(i.updatedAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const { user } = useAuth();

  useEffect(() => { adminAPI.getCustomers().then(({ data }) => setCustomers(data.data)); }, []);

  const toggleBlock = async (id) => {
    if (user?.role !== 'admin') return;
    await adminAPI.toggleBlock(id);
    const { data } = await adminAPI.getCustomers();
    setCustomers(data.data);
  };

  return (
    <div>
      <h1>Customers</h1>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Purchases</th><th>Status</th>{user?.role === 'admin' && <th>Action</th>}</tr></thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{formatPrice(c.totalPurchases)}</td>
                <td>{c.isBlocked ? 'Blocked' : 'Active'}</td>
                {user?.role === 'admin' && (
                  <td><button className="btn btn-sm btn-outline" onClick={() => toggleBlock(c._id)}>{c.isBlocked ? 'Unblock' : 'Block'}</button></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: '', type: 'percentage', value: 10, minOrderAmount: 500 });

  useEffect(() => { adminAPI.getCoupons().then(({ data }) => setCoupons(data.data)); }, []);

  const create = async (e) => {
    e.preventDefault();
    await adminAPI.createCoupon(form);
    showToast('Coupon created');
    const { data } = await adminAPI.getCoupons();
    setCoupons(data.data);
  };

  return (
    <div>
      <h1>Coupons</h1>
      <form onSubmit={create} className="admin-form-inline" style={{ marginBottom: 24 }}>
        <input className="form-control" placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
        <select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="percentage">Percentage</option>
          <option value="flat">Flat</option>
        </select>
        <input className="form-control" type="number" placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: +e.target.value })} />
        <button className="btn btn-primary btn-sm">Create</button>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Used</th><th>Active</th></tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id}>
                <td>{c.code}</td>
                <td>{c.type}</td>
                <td>{c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}</td>
                <td>{c.usedCount}/{c.usageLimit || '∞'}</td>
                <td>{c.isActive ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminPanel = () => (
  <AdminLayout>
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="products" element={<AdminProducts />} />
      <Route path="inventory" element={<AdminInventory />} />
      <Route path="customers" element={<AdminCustomers />} />
      <Route path="coupons" element={<AdminCoupons />} />
    </Routes>
  </AdminLayout>
);

export default AdminPanel;
