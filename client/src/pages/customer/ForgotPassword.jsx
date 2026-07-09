import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import { authAPI } from '../../services';
import { showToast } from '../../components/common/Toast';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await authAPI.forgotPassword(email);
    setSent(true);
    showToast('Reset link sent if email exists');
  };

  return (
    <>
      <SEO title="Forgot Password" />
      <div className="auth-page">
        <div className="auth-card">
          <h1>Forgot Password</h1>
          {sent ? (
            <p>Check your email for reset instructions.</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }}>Send Reset Link</button>
            </form>
          )}
          <p className="auth-footer"><Link to="/login">Back to Login</Link></p>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
