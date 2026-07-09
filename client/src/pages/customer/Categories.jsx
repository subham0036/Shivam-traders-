import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import { categoryAPI } from '../../services';

const Categories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryAPI.getAll().then(({ data }) => setCategories(data.data));
  }, []);

  return (
    <>
      <SEO title="Categories" description="Browse murtis by category" />
      <div className="container" style={{ padding: '60px 20px' }}>
        <h1 className="section-title">Shop by Category</h1>
        <p className="section-subtitle">Explore our divine collections</p>
        <div className="grid-3">
          {categories.map((cat) => (
            <Link key={cat._id} to={`/shop?category=${cat._id}`} style={{
              background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow)',
              transition: 'transform 0.3s', display: 'block',
            }}>
              <img src={cat.image?.url || `https://picsum.photos/seed/${cat.slug}/400/300`} alt={cat.name} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
              <div style={{ padding: 24 }}>
                <h3 style={{ marginBottom: 8 }}>{cat.name}</h3>
                <p style={{ color: 'var(--text-light)', fontSize: 14 }}>{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Categories;
