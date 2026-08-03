import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import { authAPI, orderAPI, wishlistAPI } from '../../services';
import { formatPrice, ORDER_STATUS } from '../../utils/helpers';
import { openInvoicePrint } from '../../utils/invoice';
import { resolveProductImage } from '../../utils/storeImages';
import { showToast } from '../../components/common/Toast';

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
      <div className="container profile-page">
        <h1>My Account</h1>
        <div className="profile-layout">
          <nav className="profile-nav">
            {['orders', 'wishlist', 'profile', 'addresses', 'password'].map((t) => (
              <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
            <button type="button" className="logout-btn" onClick={() => { logout(); navigate('/'); }}>Logout</button>
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
                    <div className="order-card-actions">
                      <span className="order-card-total">{formatPrice(o.totalPrice)}</span>
                      <div className="order-card-buttons">
                        {o.paymentMethod === 'upi' && o.paymentStatus === 'pending' && !o.paymentScreenshot?.url && (
                          <Link to={`/order-success/${o.orderNumber}`} className="btn btn-sm btn-primary">Pay via UPI</Link>
                        )}
                        <button type="button" className="btn btn-outline btn-sm order-invoice-btn" onClick={() => downloadInvoice(o._id)}>
                          Print Invoice
                        </button>
                        <Link to={`/track-order?order=${o.orderNumber}`} className="btn btn-sm btn-outline">Track</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'wishlist' && (
              <div>
                <h2>Wishlist</h2>
                {wishlist.length === 0 ? <p>No items in wishlist</p> : (
                  <div className="wishlist-grid">
                    {wishlist.map((p) => (
                      <Link key={p._id} to={`/product/${p.slug}`} className="wishlist-item">
                        <img src={resolveProductImage(p.images)} alt={p.name} />
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
    </>
  );
};

export default Profile;
