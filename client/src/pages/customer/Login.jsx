import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/common/Toast';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      showToast('Welcome back!');
      navigate(user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/profile');
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Login" />
      <div className="auth-page">
        <div className="auth-card">
          <h1>Welcome Back</h1>
          <p>Login to your Shivam Traders account</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="auth-footer">Don't have an account? <Link to="/register">Register</Link></p>
        </div>
      </div>
    </>
  );
};

export default Login;
