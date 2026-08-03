import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiShoppingBag, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Header.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    setSearchOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/categories', label: 'Categories' },
    { to: '/contact', label: 'Contact' },
  ];

  const renderNavLinks = (className = '', { mobile = false } = {}) => (
    <nav className={className}>
      {navLinks.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={location.pathname === link.to ? 'active' : ''}
          onClick={closeMenu}
        >
          {link.label}
        </Link>
      ))}
      {mobile && !user && (
        <>
          <div className="nav-mobile-divider" aria-hidden="true" />
          <Link to="/login" className="nav-auth-link" onClick={closeMenu}>Customer Login</Link>
          <Link to="/register" className="nav-auth-link" onClick={closeMenu}>Create Account</Link>
          <Link to="/login" className="nav-admin-login-link" onClick={closeMenu}>Admin Login</Link>
        </>
      )}
      {mobile && user && (
        <>
          <div className="nav-mobile-divider" aria-hidden="true" />
          <Link to="/profile" className="nav-auth-link" onClick={closeMenu}>My Account</Link>
        </>
      )}
      {(user?.role === 'admin' || user?.role === 'staff') && (
        <Link
          to={user.role === 'admin' ? '/admin' : '/staff'}
          className="nav-admin-link"
          onClick={closeMenu}
        >
          {user.role === 'admin' ? 'Admin Panel' : 'Staff Panel'}
        </Link>
      )}
    </nav>
  );

  const mobileMenu = typeof document !== 'undefined' && createPortal(
    <>
      <div
        className={`nav-backdrop ${menuOpen ? 'open' : ''}`}
        onClick={closeMenu}
        aria-hidden={!menuOpen}
      />
      {renderNavLinks(`nav nav-mobile ${menuOpen ? 'nav-open' : ''}`, { mobile: true })}
    </>,
    document.body,
  );

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-top">
        <div className="header-top-inner">
          <span>🙏 Free Shipping above ₹2,000</span>
          <span className="header-top-sep" aria-hidden="true">|</span>
          <span>100% Authentic Handcrafted Murtis</span>
          <span className="header-top-sep" aria-hidden="true">|</span>
          <span>UPI Payment</span>
        </div>
      </div>
      <div className="header-main">
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <Link to="/" className="logo">
          <span className="logo-icon">🕉</span>
          <div className="logo-text">
            <span className="logo-name">Shivam Traders</span>
            <span className="logo-tagline">दिव्य मूर्तियाँ</span>
          </div>
        </Link>

        {renderNavLinks('nav nav-desktop')}

        <div className="header-actions">
          <button type="button" className="header-search-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search"><FiSearch /></button>
          <Link to="/cart" className="cart-link" aria-label="Cart">
            <FiShoppingBag />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          {user ? (
            <Link to="/profile" className="header-account-link" aria-label="Account">
              <FiUser />
            </Link>
          ) : (
            <Link to="/login" className="header-login-btn">Login</Link>
          )}
        </div>
      </div>

      {mobileMenu}

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="search-overlay"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="container">
              <form onSubmit={handleSearch}>
                <input
                  type="search"
                  placeholder="Search murtis by god, material, name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary btn-sm">Search</button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
