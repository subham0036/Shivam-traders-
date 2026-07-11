import { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { orderAPI } from '../../../services';
import { formatPrice, ORDER_STATUS } from '../../../utils/helpers';
import { resolveMediaUrl } from '../../../utils/invoice';
import { showToast } from '../../../components/common/Toast';
import { printInvoice } from '../utils/printInvoice';

const STATUS_ACTIONS = [
  { status: 'confirmed', label: 'Confirm Order' },
  { status: 'packing', label: 'Start Packing' },
  { status: 'packed', label: 'Mark Packed' },
  { status: 'shipped', label: 'Ship Order' },
  { status: 'out_for_delivery', label: 'Out for Delivery' },
  { status: 'delivered', label: 'Delivered' },
  { status: 'cancelled', label: 'Cancel' },
  { status: 'refunded', label: 'Refund' },
];

const OrderDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shipping, setShipping] = useState({ courierName: '', trackingNumber: '', shippingDate: '', estimatedDelivery: '', adminNotes: '' });
  const [paymentNote, setPaymentNote] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const applyOrder = (data) => {
    setOrder(data);
    setShipping({
      courierName: data.courierName || '',
      trackingNumber: data.trackingNumber || '',
      shippingDate: data.shippingDate ? data.shippingDate.slice(0, 10) : '',
      estimatedDelivery: data.estimatedDelivery ? data.estimatedDelivery.slice(0, 10) : '',
      adminNotes: data.adminNotes || '',
    });
  };

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const { data } = await orderAPI.getById(id);
      applyOrder(data.data);
    } catch {
      setError('Could not load order. Please try again.');
      if (!order) setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const preview = location.state?.order;
    if (preview?._id === id) {
      applyOrder(preview);
      load(true);
    } else {
      setOrder(null);
      load(false);
    }
  }, [id]);

  const updateStatus = async (status) => {
    setActionLoading(status);
    try {
      const { data } = await orderAPI.updateStatus(id, { status, ...shipping });
      applyOrder(data.data);
      showToast('Order updated');
    } catch {
      showToast('Update failed');
    } finally {
      setActionLoading('');
    }
  };

  const approvePayment = async () => {
    setActionLoading('approve');
    try {
      const { data } = await orderAPI.approvePayment(id, { note: paymentNote });
      applyOrder(data.data);
      showToast('Payment approved');
    } catch {
      showToast('Approval failed');
    } finally {
      setActionLoading('');
    }
  };

  const rejectPayment = async () => {
    setActionLoading('reject');
    try {
      const { data } = await orderAPI.rejectPayment(id, { note: paymentNote });
      applyOrder(data.data);
      showToast('Payment rejected');
    } catch {
      showToast('Rejection failed');
    } finally {
      setActionLoading('');
    }
  };

  const saveShipping = async () => {
    setActionLoading('shipping');
    try {
      const { data } = await orderAPI.updateStatus(id, { ...shipping });
      applyOrder(data.data);
      showToast('Shipping updated');
    } catch {
      showToast('Save failed');
    } finally {
      setActionLoading('');
    }
  };

  const handlePrint = async () => {
    const { data } = await orderAPI.getInvoice(id);
    printInvoice(data.data);
  };

  if (error && !order) {
    return (
      <div className="admin-page-header">
        <Link to="/admin/orders" className="admin-back">← Orders</Link>
        <h1>Order not found</h1>
        <p className="muted">{error}</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => load()}>Retry</button>
      </div>
    );
  }

  if (!order && loading) {
    return (
      <div className="admin-order-skeleton">
        <div className="admin-skeleton-line wide" />
        <div className="admin-skeleton-line" />
        <div className="admin-detail-grid">
          <div className="admin-card admin-skeleton-card" />
          <div className="admin-card admin-skeleton-card" />
          <div className="admin-card admin-skeleton-card admin-card-wide" />
        </div>
      </div>
    );
  }

  const customerEmail = order.user?.email || order.guestEmail;
  const screenshotUrl = resolveMediaUrl(order.paymentScreenshot?.url);

  return (
    <div className={loading ? 'admin-detail-loading' : ''}>
      {loading && <div className="admin-detail-refresh">Refreshing...</div>}

      <div className="admin-page-header">
        <div>
          <Link to="/admin/orders" className="admin-back">← Orders</Link>
          <h1>{order.orderNumber}</h1>
          <p>{ORDER_STATUS[order.status] || order.status} · {order.paymentStatus}</p>
        </div>
        <div className="admin-page-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={handlePrint}>Print Invoice</button>
        </div>
      </div>

      <div className="admin-detail-grid">
        <div className="admin-card">
          <h3>Customer</h3>
          <p><strong>{order.shippingAddress?.fullName}</strong></p>
          <p>{customerEmail}</p>
          <p>{order.shippingAddress?.phone || order.guestPhone}</p>
          <p className="muted">{order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}</p>
        </div>

        <div className="admin-card">
          <h3>Payment</h3>
          <p>Method: <strong>{order.paymentMethod?.toUpperCase()}</strong></p>
          <p>Status: <strong>{order.paymentStatus}</strong></p>
          {order.upiTransactionId && <p>UPI TXN: {order.upiTransactionId}</p>}
          {screenshotUrl ? (
            <a href={screenshotUrl} target="_blank" rel="noreferrer" className="admin-screenshot-link">
              <img
                src={screenshotUrl}
                alt="Payment screenshot"
                className="admin-payment-screenshot"
                loading="lazy"
                decoding="async"
              />
              <span className="admin-screenshot-label">Click to view full size</span>
            </a>
          ) : order.paymentMethod === 'upi' && (
            <p className="muted">No payment screenshot uploaded yet</p>
          )}
          {order.paymentStatus === 'pending' && order.paymentMethod === 'upi' && (
            <div className="admin-action-row">
              <input className="form-control" placeholder="Admin note" value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} />
              <button type="button" className="btn btn-primary btn-sm" onClick={approvePayment} disabled={!!actionLoading}>
                {actionLoading === 'approve' ? 'Approving...' : 'Approve Payment'}
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={rejectPayment} disabled={!!actionLoading}>
                {actionLoading === 'reject' ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          )}
        </div>

        <div className="admin-card admin-card-wide">
          <h3>Items</h3>
          <table className="admin-table compact">
            <thead><tr><th>Product</th><th>Qty</th><th>Price</th></tr></thead>
            <tbody>
              {order.items?.map((item, i) => (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="admin-total">Total: <strong>{formatPrice(order.totalPrice)}</strong></p>
        </div>

        <div className="admin-card">
          <h3>Shipping</h3>
          <div className="admin-form-stack">
            <input className="form-control" placeholder="Courier (e.g. Blue Dart)" value={shipping.courierName} onChange={(e) => setShipping({ ...shipping, courierName: e.target.value })} />
            <input className="form-control" placeholder="Tracking number" value={shipping.trackingNumber} onChange={(e) => setShipping({ ...shipping, trackingNumber: e.target.value })} />
            <input className="form-control" type="date" value={shipping.shippingDate} onChange={(e) => setShipping({ ...shipping, shippingDate: e.target.value })} />
            <input className="form-control" type="date" value={shipping.estimatedDelivery} onChange={(e) => setShipping({ ...shipping, estimatedDelivery: e.target.value })} />
            <textarea className="form-control" rows={2} placeholder="Admin notes" value={shipping.adminNotes} onChange={(e) => setShipping({ ...shipping, adminNotes: e.target.value })} />
            <button type="button" className="btn btn-primary btn-sm" onClick={saveShipping} disabled={actionLoading === 'shipping'}>
              {actionLoading === 'shipping' ? 'Saving...' : 'Save Shipping'}
            </button>
          </div>
        </div>

        <div className="admin-card">
          <h3>Update Status</h3>
          <div className="admin-status-buttons">
            {STATUS_ACTIONS.map((a) => (
              <button key={a.status} type="button" className="btn btn-outline btn-sm" onClick={() => updateStatus(a.status)} disabled={!!actionLoading}>
                {actionLoading === a.status ? 'Updating...' : a.label}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-card admin-card-wide">
          <h3>Timeline</h3>
          <ul className="admin-timeline">
            {order.statusHistory?.slice().reverse().map((h, i) => (
              <li key={i}>
                <strong>{ORDER_STATUS[h.status] || h.status}</strong>
                <span>{h.note}</span>
                <small>{new Date(h.updatedAt).toLocaleString('en-IN')}</small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
