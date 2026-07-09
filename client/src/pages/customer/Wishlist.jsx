import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import ProductCard from '../../components/common/ProductCard';
import { wishlistAPI } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/helpers';

const Wishlist = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (user) wishlistAPI.get().then(({ data }) => setProducts(data.data.products || []));
  }, [user]);

  return (
    <>
      <SEO title="Wishlist" />
      <div className="container" style={{ padding: '40px 20px' }}>
        <h1 style={{ marginBottom: 32 }}>My Wishlist</h1>
        {!user ? (
          <p>Please <Link to="/login">login</Link> to view your wishlist.</p>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <p>Your wishlist is empty</p>
            <Link to="/shop" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Products</Link>
          </div>
        ) : (
          <div className="grid-4">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </>
  );
};

export default Wishlist;
