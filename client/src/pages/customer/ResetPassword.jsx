import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import { authAPI } from '../../services';
import { showToast } from '../../components/common/Toast';
import './Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return showToast('Password must be at least 6 characters');
    if (password !== confirmPassword) return showToast('Passwords do not match');
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      showToast('Password reset successful');
      navigate('/login', { replace: true });
    } catch (err) {
      showToast(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Reset Password" />
      <div className="auth-page">
        <div className="auth-card">
          <h1>Reset Password</h1>
          <p>Enter your new password</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New Password</label>
              <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input className="form-control" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Saving...' : 'Reset Password'}
            </button>
          </form>
          <p className="auth-footer"><Link to="/login">Back to Login</Link></p>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
