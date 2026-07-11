import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import { authAPI, orderAPI, wishlistAPI } from '../../services';
import { formatPrice, ORDER_STATUS } from '../../utils/helpers';
import { openInvoicePrint } from '../../utils/invoice';
import { showToast } from '../../components/common/Toast';
import '../customer/Auth.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [address, setAddress] = useState({ fullName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '', isDefault: true });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    orderAPI.getMyOrders().then(({ data }) => setOrders(data.data));
    wishlistAPI.get().then(({ data }) => setWishlist(data.data.products || []));
  }, [user, navigate]);

  const updateProfile = async (e) => {
    e.preventDefault();
    await authAPI.updateProfile(profile);
    showToast('Profile updated');
  };

  const changePassword = async (e) => {
    e.preventDefault();
    await authAPI.changePassword(passwords);
    showToast('Password changed');
    setPasswords({ currentPassword: '', newPassword: '' });
  };

  const addAddress = async (e) => {
    e.preventDefault();
    await authAPI.addAddress(address);
    showToast('Address added');
    const { data } = await authAPI.getMe();
    // refresh would happen via context ideally
  };

  const downloadInvoice = async (orderId) => {
    const { data } = await orderAPI.getInvoice(orderId);
    openInvoicePrint(data.data);
  };

  if (!user) return null;

  return (
    <>
      <SEO title="My Profile" />
      <div className="container" style={{ padding: '40px 20px' }}>
        <h1 style={{ marginBottom: 32 }}>My Account</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32 }}>
          <nav className="profile-nav">
            {['orders', 'wishlist', 'profile', 'addresses', 'password'].map((t) => (
              <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
            <button onClick={() => { logout(); navigate('/'); }} style={{ color: '#e74c3c' }}>Logout</button>
          </nav>

          <div className="profile-content">
            {tab === 'orders' && (
              <div>
                <h2>Order History</h2>
                {orders.length === 0 ? <p>No orders yet</p> : orders.map((o) => (
                  <div key={o._id} className="order-card">
                    <div>
                      <strong>{o.orderNumber}</strong>
                      <span>{new Date(o.createdAt).toLocaleDateString('en-IN')}</span>
                      <span className="badge badge-saffron">{ORDER_STATUS[o.status]}</span>
                    </div>
                    <div>
                      <span>{formatPrice(o.totalPrice)}</span>
                      {o.paymentMethod === 'upi' && o.paymentStatus === 'pending' && !o.paymentScreenshot?.url && (
                        <Link to={`/order-success/${o.orderNumber}`} className="btn btn-sm btn-primary">Pay via UPI</Link>
                      )}
                      <button className="btn btn-outline btn-sm" onClick={() => downloadInvoice(o._id)}>Invoice</button>
                      <Link to={`/track-order?order=${o.orderNumber}`} className="btn btn-sm btn-outline">Track</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'wishlist' && (
              <div>
                <h2>Wishlist</h2>
                {wishlist.length === 0 ? <p>No items in wishlist</p> : (
                  <div className="grid-3">
                    {wishlist.map((p) => (
                      <Link key={p._id} to={`/product/${p.slug}`} className="wishlist-item">
                        <img src={p.images?.[0]?.url} alt={p.name} />
                        <h4>{p.name}</h4>
                        <p>{formatPrice(p.sellingPrice)}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'profile' && (
              <form onSubmit={updateProfile}>
                <h2>Profile</h2>
                <div className="form-group"><label>Name</label><input className="form-control" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
                <div className="form-group"><label>Email</label><input className="form-control" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></div>
                <div className="form-group"><label>Phone</label><input className="form-control" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
                <button className="btn btn-primary">Save</button>
              </form>
            )}

            {tab === 'addresses' && (
              <form onSubmit={addAddress}>
                <h2>Add Address</h2>
                <div className="form-group"><label>Full Name</label><input className="form-control" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} required /></div>
                <div className="form-group"><label>Phone</label><input className="form-control" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} required /></div>
                <div className="form-group"><label>Address</label><input className="form-control" value={address.addressLine1} onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })} required /></div>
                <div className="grid-3">
                  <div className="form-group"><label>City</label><input className="form-control" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required /></div>
                  <div className="form-group"><label>State</label><input className="form-control" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} required /></div>
                  <div className="form-group"><label>Pincode</label><input className="form-control" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} required /></div>
                </div>
                <button className="btn btn-primary">Add Address</button>
              </form>
            )}

            {tab === 'password' && (
              <form onSubmit={changePassword}>
                <h2>Change Password</h2>
                <div className="form-group"><label>Current Password</label><input className="form-control" type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required /></div>
                <div className="form-group"><label>New Password</label><input className="form-control" type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required minLength={6} /></div>
                <button className="btn btn-primary">Update Password</button>
              </form>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .profile-nav { display: flex; flex-direction: column; gap: 4px; }
        .profile-nav button { text-align: left; padding: 12px 16px; border-radius: 8px; font-weight: 500; transition: all 0.2s; }
        .profile-nav button.active { background: var(--saffron); color: white; }
        .profile-nav button:hover:not(.active) { background: var(--cream); }
        .profile-content { background: white; padding: 32px; border-radius: 16px; box-shadow: var(--shadow); }
        .profile-content h2 { margin-bottom: 24px; }
        .order-card { display: flex; justify-content: space-between; align-items: center; padding: 16px; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 12px; flex-wrap: wrap; gap: 12px; }
        .order-card span { margin-right: 12px; font-size: 14px; color: var(--text-light); }
        .wishlist-item { background: white; border-radius: 12px; overflow: hidden; box-shadow: var(--shadow); padding-bottom: 12px; }
        .wishlist-item img { width: 100%; aspect-ratio: 4/5; object-fit: cover; }
        .wishlist-item h4 { padding: 8px 12px 4px; font-size: 14px; }
        .wishlist-item p { padding: 0 12px; font-weight: 700; }
        @media (max-width: 768px) { .container > div { grid-template-columns: 1fr !important; } .profile-nav { flex-direction: row; flex-wrap: wrap; } }
      `}</style>
    </>
  );
};

export default Profile;
