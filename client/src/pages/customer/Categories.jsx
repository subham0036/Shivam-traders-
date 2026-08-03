import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import { categoryAPI } from '../../services';
import { resolveMediaUrl } from '../../utils/storeImages';

const Categories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryAPI.getAll().then(({ data }) => setCategories(data.data));
  }, []);

  return (
    <>
      <SEO title="Categories" description="Browse murtis by category" />
      <div className="page-hero">
        <div className="container">
          <span className="om-deco">🕉</span>
          <h1>Shop by Category</h1>
          <p>श्रेणी अनुसार दिव्य मूर्तियाँ खोजें</p>
        </div>
      </div>
      <div className="container content-section">
        <div className="grid-3">
          {categories.map((cat) => (
            <Link key={cat._id} to={`/shop?category=${cat._id}`} className="category-card">
              <img
                src={resolveMediaUrl(cat.image?.url) || `https://picsum.photos/seed/${cat.slug}/400/300`}
                alt={cat.name}
              />
              <div className="category-card-body">
                <h3>{cat.name}</h3>
                <p>{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Categories;
