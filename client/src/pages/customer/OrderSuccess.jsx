import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import SEO from '../../components/common/SEO';
import UpiPaymentBox, { UPI_DEFAULTS } from '../../components/common/UpiPaymentBox';
import { orderAPI, adminAPI } from '../../services';
import { formatPrice } from '../../utils/helpers';
import { showToast } from '../../components/common/Toast';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [txnId, setTxnId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      orderAPI.track(orderNumber).then(({ data }) => setOrder(data.data)),
      adminAPI.getSettings().then(({ data }) => setSettings(data.data)).catch(() => {}),
    ]).catch(() => showToast('Could not load order details'))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  const submitPayment = async () => {
    if (!txnId || !screenshot) return showToast('Transaction ID and screenshot required');
    if (!order?._id) return showToast('Order not loaded yet');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('upiTransactionId', txnId);
      fd.append('screenshot', screenshot);
      await orderAPI.uploadUpiPayment(order._id, fd);
      showToast('Payment proof submitted!');
      const { data } = await orderAPI.track(orderNumber);
      setOrder(data.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const isUpiOrder = order?.paymentMethod === 'upi';
  const needsPayment = isUpiOrder && order?.paymentStatus === 'pending' && !order?.paymentScreenshot?.url;
  const paymentSubmitted = isUpiOrder && order?.paymentStatus === 'pending' && order?.paymentScreenshot?.url;
  const isConfirmed = order?.paymentStatus === 'paid';

  const upiId = settings?.payment?.upiId || UPI_DEFAULTS.upiId;
  const upiName = settings?.payment?.upiName || UPI_DEFAULTS.upiName;

  let pageTitle = 'Order Confirmed';
  let heading = 'Order Confirmed!';
  let subtext = 'Thank you for your order.';
  let Icon = FiCheckCircle;
  let iconClass = 'order-success-icon confirmed';

  if (needsPayment) {
    pageTitle = 'Complete Payment';
    heading = 'Complete Your UPI Payment';
    subtext = 'Your order is saved. Pay the exact amount below — it is not confirmed until payment is verified.';
    Icon = FiClock;
    iconClass = 'order-success-icon pending';
  } else if (paymentSubmitted) {
    pageTitle = 'Payment Submitted';
    heading = 'Payment Proof Submitted';
    subtext = 'We received your payment screenshot. Admin will verify shortly.';
    Icon = FiAlertCircle;
    iconClass = 'order-success-icon submitted';
  } else if (isUpiOrder && !isConfirmed) {
    pageTitle = 'Order Placed';
    heading = 'Order Placed';
    subtext = 'Your order details are saved.';
    Icon = FiClock;
    iconClass = 'order-success-icon pending';
  }

  return (
    <>
      <SEO title={pageTitle} />
      <div className="order-success-page">
        <div className="container order-success-inner">
          <Icon className={iconClass} />
          <h1>{heading}</h1>
          <p className="order-success-sub">{subtext}</p>

          {needsPayment && (
            <div className="order-pending-banner">
              ⏳ Payment pending — order will be confirmed after admin verifies your UPI payment
            </div>
          )}

          {loading && <div className="loading-spinner" />}

          {!loading && order && (
            <div className="order-success-card">
              <p><strong>Order Number:</strong> {order.orderNumber}</p>
              <p><strong>Total:</strong> {formatPrice(order.totalPrice)}</p>
              <p><strong>Payment:</strong> {order.paymentMethod?.toUpperCase()} — <span className={needsPayment ? 'status-pending' : ''}>{order.paymentStatus}</span></p>

              {needsPayment && (
                <div className="upi-payment-section">
                  <h3>Step 1: Pay via UPI</h3>
                  <UpiPaymentBox
                    amount={order.totalPrice}
                    upiId={upiId}
                    upiName={upiName}
                    orderNote={order.orderNumber}
                    showForm
                    txnId={txnId}
                    onTxnIdChange={setTxnId}
                    screenshot={screenshot}
                    onScreenshotChange={setScreenshot}
                    onSubmit={submitPayment}
                    submitting={uploading}
                  />
                </div>
              )}

              {paymentSubmitted && (
                <p className="upi-pending-msg">Awaiting admin verification. You will be notified once payment is approved.</p>
              )}
            </div>
          )}

          {!loading && !order && (
            <p className="order-success-sub">Order not found. Check your order number and try again.</p>
          )}

          <div className="order-success-actions">
            {orderNumber && <Link to={`/track-order?order=${orderNumber}`} className="btn btn-outline">Track Order</Link>}
            {!needsPayment && <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccess;
