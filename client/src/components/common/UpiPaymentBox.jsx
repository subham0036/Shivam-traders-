import { useEffect, useState } from 'react';
import { FiCopy } from 'react-icons/fi';
import { formatPrice } from '../../utils/helpers';
import { generateUpiQr, UPI_DEFAULTS } from '../../utils/upiQr';
import { showToast } from '../common/Toast';
import './UpiPaymentBox.css';

export { UPI_DEFAULTS };

const UpiPaymentBox = ({
  amount,
  upiId = UPI_DEFAULTS.upiId,
  upiName = UPI_DEFAULTS.upiName,
  orderNote = '',
  showForm = false,
  txnId = '',
  onTxnIdChange,
  screenshot = null,
  onScreenshotChange,
  onSubmit,
  submitting = false,
  compact = false,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrLoading, setQrLoading] = useState(true);

  useEffect(() => {
    if (amount == null || amount <= 0) {
      setQrDataUrl(UPI_DEFAULTS.qrUrl);
      setQrLoading(false);
      return;
    }

    let cancelled = false;
    setQrLoading(true);

    generateUpiQr({ upiId, upiName, amount, note: orderNote || 'Shivam Traders Order' })
      .then((url) => { if (!cancelled) setQrDataUrl(url); })
      .catch(() => { if (!cancelled) setQrDataUrl(UPI_DEFAULTS.qrUrl); })
      .finally(() => { if (!cancelled) setQrLoading(false); });

    return () => { cancelled = true; };
  }, [amount, upiId, upiName, orderNote]);

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    showToast('UPI ID copied!');
  };

  return (
    <div className={`upi-payment-box ${compact ? 'compact' : ''}`}>
      {amount != null && (
        <p className="upi-payment-amount">
          Amount to pay: <strong>{formatPrice(amount)}</strong>
          <span className="upi-amount-note"> — QR includes this amount automatically</span>
        </p>
      )}

      <div className="upi-qr-block">
        <div className="upi-qr-wrap">
          {qrLoading ? (
            <div className="upi-qr-loading">Generating QR...</div>
          ) : (
            <img src={qrDataUrl} alt={`UPI QR — ${formatPrice(amount)}`} className="upi-qr-image" />
          )}
        </div>
        <div className="upi-details">
          {upiName && <p className="upi-name">{upiName}</p>}
          <button type="button" className="upi-id-copy" onClick={copyUpi}>
            <span>{upiId}</span>
            <FiCopy />
          </button>
          <p className="upi-hint">Scan QR in PhonePe, GPay, or Paytm — amount will be pre-filled</p>
        </div>
      </div>

      {showForm ? (
        <>
          <div className="form-group">
            <label>UPI Transaction ID *</label>
            <input
              className="form-control"
              value={txnId}
              onChange={(e) => onTxnIdChange?.(e.target.value)}
              placeholder="e.g. 123456789012"
              required
            />
          </div>
          <div className="form-group">
            <label>Payment Screenshot *</label>
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={(e) => onScreenshotChange?.(e.target.files[0])}
              required
            />
          </div>
          {onSubmit && (
            <button type="button" className="btn btn-primary upi-submit-btn" disabled={submitting} onClick={onSubmit}>
              {submitting ? 'Uploading...' : 'Submit Payment Proof'}
            </button>
          )}
        </>
      ) : (
        <p className="upi-checkout-note">Place your order first, then enter your transaction ID and upload payment screenshot on the next page.</p>
      )}
    </div>
  );
};

export default UpiPaymentBox;
