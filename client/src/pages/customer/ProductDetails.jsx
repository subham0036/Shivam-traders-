import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiHeart, FiShare2, FiShield, FiTruck, FiMessageCircle, FiVideo } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import SEO from '../../components/common/SEO';
import ProductCard from '../../components/common/ProductCard';
import { productAPI, reviewAPI, wishlistAPI } from '../../services';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, getDiscountPercent, shareProduct } from '../../utils/helpers';
import { showToast } from '../../components/common/Toast';
import './ProductDetails.css';

const ProductDetails = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [pincode, setPincode] = useState('');
  const [delivery, setDelivery] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  const [newQuestion, setNewQuestion] = useState('');
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await productAPI.getBySlug(slug);
      setProduct(data.data);
      const rev = await reviewAPI.getByProduct(data.data._id);
      setReviews(rev.data.data);
      localStorage.setItem('recently_viewed', JSON.stringify([
        data.data._id,
        ...JSON.parse(localStorage.getItem('recently_viewed') || '[]').filter((id) => id !== data.data._id),
      ].slice(0, 8)));
    };
    fetchProduct();
  }, [slug]);

  if (!product) return <div className="loading-spinner" />;

  const discount = product.discount || getDiscountPercent(product.mrp, product.sellingPrice);
  const images = product.images?.length ? product.images : [{ url: 'https://picsum.photos/600/800' }];

  const handleAddToCart = async () => {
    await addToCart(product._id, quantity);
    showToast('Added to cart');
  };

  const handleBuyNow = async () => {
    await addToCart(product._id, quantity);
    navigate('/checkout');
  };

  const handleWishlist = async () => {
    if (!user) return showToast('Please login first');
    await wishlistAPI.add(product._id);
    showToast('Added to wishlist');
  };

  const checkPincode = async () => {
    const { data } = await productAPI.checkDelivery(pincode);
    setDelivery(data.data);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return showToast('Please login to review');
    await reviewAPI.create({ productId: product._id, ...newReview });
    showToast('Review submitted');
    const rev = await reviewAPI.getByProduct(product._id);
    setReviews(rev.data.data);
  };

  const submitQuestion = async (e) => {
    e.preventDefault();
    await reviewAPI.addQuestion({ productId: product._id, question: newQuestion, name: user?.name });
    showToast('Question submitted');
    setNewQuestion('');
  };

  return (
    <>
      <SEO
        title={product.name}
        description={product.shortDescription || product.description?.slice(0, 160)}
        image={images[0]?.url}
        type="product"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: images[0]?.url,
          description: product.description,
          sku: product.sku,
          offers: { '@type': 'Offer', price: product.sellingPrice, priceCurrency: 'INR', availability: product.stock > 0 ? 'InStock' : 'OutOfStock' },
        }}
      />

      <div className="product-page">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span>{product.name}</span>
          </nav>

          <div className="product-layout">
            <div className="product-gallery">
              <div className="main-image">
                <img src={images[activeImage]?.url} alt={product.name} />
              </div>
              <div className="thumb-list">
                {images.map((img, i) => (
                  <button key={i} className={activeImage === i ? 'active' : ''} onClick={() => setActiveImage(i)}>
                    <img src={img.url} alt="" />
                  </button>
                ))}
              </div>
              {product.video?.url && (
                <div className="product-video">
                  <video src={product.video.url} controls poster={images[0]?.url} />
                </div>
              )}
            </div>

            <div className="product-info">
              <span className="product-god-tag">{product.godName} • {product.material}</span>
              <h1>{product.name}</h1>
              <div className="product-rating-row">
                <div className="stars">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</div>
                <span>{product.rating?.toFixed(1)} ({product.numReviews} reviews)</span>
              </div>

              <div className="price-row">
                <span className="price">{formatPrice(product.sellingPrice)}</span>
                {product.mrp > product.sellingPrice && <span className="mrp">{formatPrice(product.mrp)}</span>}
                {discount > 0 && <span className="discount-badge">{discount}% OFF</span>}
              </div>

              <div className="stock-status">
                {product.stock > 0 ? (
                  <span className="in-stock">✓ In Stock {product.stock <= 5 && `— Only ${product.stock} left!`}</span>
                ) : (
                  <span className="out-stock">Out of Stock</span>
                )}
              </div>

              <div className="product-meta">
                <span>SKU: {product.sku}</span>
                <span>Height: {product.height}"</span>
                {product.width && <span>Width: {product.width}"</span>}
                {product.weight && <span>Weight: {product.weight}g</span>}
              </div>

              <div className="trust-badges">
                <span><FiShield /> Secure Payment</span>
                <span><FiTruck /> Fast Delivery</span>
                <span>📱 UPI Payment</span>
                <span>✓ 100% Original</span>
              </div>

              <div className="quantity-row">
                <label>Quantity:</label>
                <div className="qty-selector">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
                </div>
              </div>

              <div className="action-buttons">
                <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={!product.stock}>Add to Cart</button>
                <button className="btn btn-gold btn-lg" onClick={handleBuyNow} disabled={!product.stock}>Buy Now</button>
                <button className="btn-icon" onClick={handleWishlist}><FiHeart /></button>
                <button className="btn-icon" onClick={() => shareProduct(product).then((msg) => msg && showToast(msg))}><FiShare2 /></button>
              </div>

              <div className="enquiry-buttons">
                <a href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}?text=Enquiry about ${product.name}`} className="btn btn-outline btn-sm" target="_blank" rel="noopener noreferrer">
                  <FaWhatsapp /> WhatsApp Enquiry
                </a>
                <a href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}?text=Request live video for ${product.name}`} className="btn btn-outline btn-sm">
                  <FiVideo /> Request Live Video
                </a>
              </div>

              <div className="pincode-checker">
                <h4>Check Delivery</h4>
                <div className="pincode-input">
                  <input type="text" placeholder="Enter pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} maxLength={6} />
                  <button className="btn btn-primary btn-sm" onClick={checkPincode}>Check</button>
                </div>
                {delivery && <p className="delivery-result">Estimated delivery: {new Date(delivery.estimatedDelivery).toLocaleDateString('en-IN')} ({delivery.estimatedDays} days)</p>}
              </div>
            </div>
          </div>

          <div className="product-tabs">
            <div className="tab-nav">
              {['description', 'specifications', 'care', 'reviews', 'qa'].map((tab) => (
                <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
                  {tab === 'qa' ? 'Q&A' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="tab-content">
              {activeTab === 'description' && <p>{product.description}</p>}
              {activeTab === 'specifications' && (
                <table className="spec-table">
                  <tbody>
                    {(product.specifications || []).map((s) => (
                      <tr key={s.key}><td>{s.key}</td><td>{s.value}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
              {activeTab === 'care' && (
                <ul>{(product.careInstructions || []).map((c, i) => <li key={i}>{c}</li>)}</ul>
              )}
              {activeTab === 'reviews' && (
                <div>
                  {reviews.map((r) => (
                    <div key={r._id} className="review-item">
                      <strong>{r.name}</strong> {'★'.repeat(r.rating)}
                      <p>{r.comment}</p>
                    </div>
                  ))}
                  {user && (
                    <form onSubmit={submitReview} className="review-form">
                      <h4>Write a Review</h4>
                      <select value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: +e.target.value })}>
                        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Stars</option>)}
                      </select>
                      <input className="form-control" placeholder="Title" value={newReview.title} onChange={(e) => setNewReview({ ...newReview, title: e.target.value })} />
                      <textarea className="form-control" placeholder="Your review" value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} required />
                      <button className="btn btn-primary btn-sm">Submit Review</button>
                    </form>
                  )}
                </div>
              )}
              {activeTab === 'qa' && (
                <div>
                  {(product.questions || []).map((q) => (
                    <div key={q._id} className="qa-item">
                      <p><FiMessageCircle /> <strong>Q:</strong> {q.question}</p>
                      {q.answer && <p className="answer"><strong>A:</strong> {q.answer}</p>}
                    </div>
                  ))}
                  <form onSubmit={submitQuestion} className="qa-form">
                    <input className="form-control" placeholder="Ask a question..." value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} required />
                    <button className="btn btn-primary btn-sm">Ask</button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {product.suggestedRelated?.length > 0 && (
            <section className="related-section">
              <h2>Related Products</h2>
              <div className="grid-4">
                {product.suggestedRelated.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            </section>
          )}
        </div>

        <div className="sticky-add-cart">
          <span className="sticky-price">{formatPrice(product.sellingPrice)}</span>
          <button className="btn btn-primary" onClick={handleAddToCart} disabled={!product.stock}>Add to Cart</button>
          <button className="btn btn-gold" onClick={handleBuyNow} disabled={!product.stock}>Buy Now</button>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
