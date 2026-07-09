import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiShoppingBag, FiHeart, FiUser, FiMenu, FiX } from 'react-icons/fi';
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

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    setSearchOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/categories', label: 'Categories' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-top">
        <p>🙏 Free Shipping above ₹2,000 &nbsp;|&nbsp; 100% Authentic Handcrafted Murtis &nbsp;|&nbsp; COD Available</p>
      </div>
      <div className="header-main">
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <Link to="/" className="logo">
          <span className="logo-icon">🕉</span>
          <div>
            <span className="logo-name">Shivam Traders</span>
            <span className="logo-tagline">दिव्य मूर्तियाँ</span>
          </div>
        </Link>

        <div className={`nav-backdrop ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className={location.pathname === link.to ? 'active' : ''}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button onClick={() => setSearchOpen(!searchOpen)} aria-label="Search"><FiSearch /></button>
          <Link to="/wishlist" aria-label="Wishlist"><FiHeart /></Link>
          <Link to="/cart" className="cart-link" aria-label="Cart">
            <FiShoppingBag />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          <Link to={user ? '/profile' : '/login'} aria-label="Account"><FiUser /></Link>
        </div>
      </div>

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
