import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiGrid, FiList, FiFilter, FiX } from 'react-icons/fi';
import SEO from '../../components/common/SEO';
import ProductCard from '../../components/common/ProductCard';
import { productAPI } from '../../services';
import { GODS, MATERIALS } from '../../utils/helpers';
import './Shop.css';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickView, setQuickView] = useState(null);

  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    god: searchParams.get('god') || '',
    material: searchParams.get('material') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minHeight: searchParams.get('minHeight') || '',
    maxHeight: searchParams.get('maxHeight') || '',
    inStock: searchParams.get('inStock') || '',
    sort: searchParams.get('sort') || 'newest',
    page: searchParams.get('page') || '1',
    featured: searchParams.get('featured') || '',
    trending: searchParams.get('trending') || '',
    bestSeller: searchParams.get('bestSeller') || '',
    newArrival: searchParams.get('newArrival') || '',
    premium: searchParams.get('premium') || '',
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v)
        );
        const { data } = await productAPI.getAll(params);
        setProducts(data.data);
        setPagination(data.pagination);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});

  return (
    <>
      <SEO title="Shop All Murtis" description="Browse our complete collection of premium Hindu God Murtis" />

      <div className="shop-page">
        <div className="shop-header">
          <div className="container">
            <h1>Shop Divine Murtis</h1>
            <p>{pagination.total || 0} products found</p>
          </div>
        </div>

        <div className="container shop-layout">
          <aside className={`shop-filters ${filtersOpen ? 'open' : ''}`}>
            <div className="filters-header">
              <h3><FiFilter /> Filters</h3>
              <button onClick={() => setFiltersOpen(false)} className="mobile-close"><FiX /></button>
            </div>

            <div className="filter-group">
              <label>Search</label>
              <input
                type="search"
                className="form-control"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>God</label>
              <select className="form-control" value={filters.god} onChange={(e) => updateFilter('god', e.target.value)}>
                <option value="">All Gods</option>
                {GODS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label>Material</label>
              <select className="form-control" value={filters.material} onChange={(e) => updateFilter('material', e.target.value)}>
                <option value="">All Materials</option>
                {MATERIALS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range (₹)</label>
              <div className="price-inputs">
                <input type="number" className="form-control" placeholder="Min" value={filters.minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} />
                <input type="number" className="form-control" placeholder="Max" value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} />
              </div>
            </div>

            <div className="filter-group">
              <label>Height (inches)</label>
              <div className="price-inputs">
                <input type="number" className="form-control" placeholder="Min" value={filters.minHeight} onChange={(e) => updateFilter('minHeight', e.target.value)} />
                <input type="number" className="form-control" placeholder="Max" value={filters.maxHeight} onChange={(e) => updateFilter('maxHeight', e.target.value)} />
              </div>
            </div>

            <div className="filter-group">
              <label>
                <input type="checkbox" checked={filters.inStock === 'true'} onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')} />
                {' '}In Stock Only
              </label>
            </div>

            <button className="btn btn-outline btn-sm" onClick={clearFilters} style={{ width: '100%' }}>Clear Filters</button>
          </aside>

          <div className="shop-main">
            <div className="shop-toolbar">
              <button className="btn btn-outline btn-sm filter-toggle" onClick={() => setFiltersOpen(true)}>
                <FiFilter /> Filters
              </button>
              <select className="form-control sort-select" value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}>
                <option value="newest">Newest</option>
                <option value="best-selling">Best Selling</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <div className="view-toggle">
                <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><FiGrid /></button>
                <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><FiList /></button>
              </div>
            </div>

            {loading ? (
              <div className="loading-spinner" />
            ) : products.length === 0 ? (
              <div className="no-products">
                <h3>No products found</h3>
                <p>Try adjusting your filters</p>
              </div>
            ) : (
              <div className={view === 'grid' ? 'grid-4 products-grid' : 'products-list'}>
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} onQuickView={setQuickView} />
                ))}
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={page === pagination.page ? 'active' : ''}
                    onClick={() => updateFilter('page', String(page))}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {quickView && (
        <div className="quick-view-overlay" onClick={() => setQuickView(null)}>
          <div className="quick-view-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setQuickView(null)}><FiX /></button>
            <img src={quickView.images?.[0]?.url} alt={quickView.name} />
            <h3>{quickView.name}</h3>
            <p>{quickView.shortDescription || quickView.description?.slice(0, 150)}</p>
            <a href={`/product/${quickView.slug}`} className="btn btn-primary">View Details</a>
          </div>
        </div>
      )}
    </>
  );
};

export default Shop;
