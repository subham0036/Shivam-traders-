import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FiMenu, FiX, FiSun, FiMoon, FiBell, FiSearch, FiLogOut, FiExternalLink,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { ToastProvider } from '../../components/common/Toast';
import AdminOrderNotifier from './components/AdminOrderNotifier';
import './Admin.css';

const SIDEBAR_LINKS = [
  { to: '/admin', label: 'Dashboard', end: true, adminOnly: false },
  { to: '/admin/orders', label: 'Orders', adminOnly: false },
  { to: '/admin/payments', label: 'Payments', adminOnly: false },
  { to: '/admin/shipping', label: 'Shipping', adminOnly: false },
  { to: '/admin/products', label: 'Products', adminOnly: false },
  { to: '/admin/products/new', label: 'Add Product', adminOnly: true, sub: true },
  { to: '/admin/categories', label: 'Categories', adminOnly: true },
  { to: '/admin/inventory', label: 'Inventory', adminOnly: false },
  { to: '/admin/customers', label: 'Customers', adminOnly: false },
  { to: '/admin/coupons', label: 'Coupons', adminOnly: true },
  { to: '/admin/reviews', label: 'Reviews', adminOnly: false },
  { to: '/admin/analytics', label: 'Analytics', adminOnly: true },
  { to: '/admin/content', label: 'Website Content', adminOnly: true },
  { to: '/admin/settings', label: 'Settings', adminOnly: true },
  { to: '/admin/users', label: 'Admin Users', adminOnly: true },
];

const BREADCRUMB_LABELS = {
  admin: 'Dashboard',
  orders: 'Orders',
  payments: 'Payments',
  shipping: 'Shipping',
  products: 'Products',
  categories: 'Categories',
  inventory: 'Inventory',
  customers: 'Customers',
  coupons: 'Coupons',
  reviews: 'Reviews',
  analytics: 'Analytics',
  content: 'Website Content',
  settings: 'Settings',
  users: 'Admin Users',
  new: 'Add Product',
  edit: 'Edit Product',
};

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('admin_dark') === '1');
  const [search, setSearch] = useState('');
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    document.documentElement.classList.toggle('admin-dark', dark);
    localStorage.setItem('admin_dark', dark ? '1' : '0');
  }, [dark]);

  const links = SIDEBAR_LINKS.filter((l) => !l.adminOnly || isAdmin);
  const crumbs = location.pathname.split('/').filter(Boolean).slice(1);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/admin/orders?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <ToastProvider>
    <div className={`admin-shell ${dark ? 'admin-dark' : ''}`}>
      <div className={`admin-sidebar-backdrop ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

      <aside className={`admin-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="admin-brand">
          <div>
            <strong>🕉 Shivam Traders</strong>
            <small>{isAdmin ? 'Owner Dashboard' : 'Staff Panel'}</small>
          </div>
          <button type="button" className="admin-icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close">
            <FiX />
          </button>
        </div>
        <nav className="admin-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `admin-nav-link ${l.sub ? 'sub' : ''} ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="admin-logout" onClick={() => { logout(); navigate('/'); }}>
          <FiLogOut /> Logout
        </button>
      </aside>

      <div className="admin-main-wrap">
        <header className="admin-topbar">
          <button type="button" className="admin-icon-btn admin-menu-toggle" onClick={() => setMenuOpen(true)}>
            <FiMenu />
          </button>
          <nav className="admin-breadcrumb" aria-label="Breadcrumb">
            <Link to="/admin">Admin</Link>
            {crumbs.map((c, i) => (
              <span key={`${c}-${i}`}>
                <span className="sep">/</span>
                <span>{BREADCRUMB_LABELS[c] || c}</span>
              </span>
            ))}
          </nav>
          <form className="admin-search" onSubmit={handleSearch}>
            <FiSearch />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..." />
          </form>
          <div className="admin-topbar-actions">
            <button type="button" className="admin-icon-btn admin-bell-btn" aria-label="Notifications">
              <FiBell />
              {notifCount > 0 && <span className="admin-bell-badge">{notifCount}</span>}
            </button>
            <button type="button" className="admin-icon-btn" onClick={() => setDark(!dark)} aria-label="Toggle theme">
              {dark ? <FiSun /> : <FiMoon />}
            </button>
            <Link to="/" className="admin-store-link" target="_blank" rel="noreferrer">
              <FiExternalLink /> Store
            </Link>
          </div>
        </header>
        <main className="admin-page">{children}</main>
      </div>
      <AdminOrderNotifier onCountChange={setNotifCount} />
    </div>
    </ToastProvider>
  );
};

export default AdminLayout;
