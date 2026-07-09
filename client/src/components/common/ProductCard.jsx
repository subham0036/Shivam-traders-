import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiStar } from 'react-icons/fi';
import { formatPrice, getDiscountPercent } from '../../utils/helpers';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { wishlistAPI } from '../../services';
import { showToast } from './Toast';
import './ProductCard.css';

const ProductCard = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const discount = product.discount || getDiscountPercent(product.mrp, product.sellingPrice);
  const image = product.images?.[0]?.url || 'https://picsum.photos/400/500';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      await addToCart(product._id, 1);
      showToast('Added to cart');
    } catch {
      showToast('Could not add to cart');
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return showToast('Please login first');
    try {
      await wishlistAPI.add(product._id);
      showToast('Added to wishlist');
    } catch {
      showToast('Already in wishlist');
    }
  };

  return (
    <motion.div
      className="product-card"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/product/${product.slug}`} className="product-card-link">
        <div className="product-card-image">
          <img src={image} alt={product.images?.[0]?.alt || product.name} loading="lazy" />
          <div className="product-badges">
            {product.isBestSeller && <span className="badge badge-gold">Best Seller</span>}
            {product.isTrending && <span className="badge badge-saffron">Trending</span>}
            {product.isNewArrival && <span className="badge badge-saffron">New</span>}
            {discount > 0 && <span className="badge badge-red">{discount}% OFF</span>}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="badge badge-red">Only {product.stock} Left</span>
            )}
          </div>
          <div className="product-card-actions">
            <button onClick={handleWishlist} aria-label="Add to wishlist"><FiHeart /></button>
            {onQuickView && <button onClick={(e) => { e.preventDefault(); onQuickView(product); }} aria-label="Quick view">👁</button>}
            <button onClick={handleAddToCart} aria-label="Add to cart"><FiShoppingBag /></button>
          </div>
        </div>
        <div className="product-card-info">
          <p className="product-god">{product.godName}</p>
          <h3 className="product-name">{product.name}</h3>
          <div className="product-rating">
            <FiStar className="star" />
            <span>{product.rating?.toFixed(1) || '4.5'}</span>
            <span className="reviews">({product.numReviews || 0})</span>
          </div>
          <div className="product-price">
            <span className="current">{formatPrice(product.sellingPrice)}</span>
            {product.mrp > product.sellingPrice && (
              <span className="mrp">{formatPrice(product.mrp)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
