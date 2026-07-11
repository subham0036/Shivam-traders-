import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { productAPI } from '../../../services';
import { formatPrice } from '../../../utils/helpers';
import { showToast } from '../../../components/common/Toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const load = () => productAPI.adminGetAll().then(({ data }) => setProducts(data.data));

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!isAdmin || !confirm('Delete this product?')) return;
    await productAPI.delete(id);
    showToast('Deleted');
    load();
  };

  const handleDuplicate = async (id) => {
    if (!isAdmin) return;
    await productAPI.duplicate(id);
    showToast('Duplicated');
    load();
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Products</h1>
        {isAdmin && <Link to="/admin/products/new" className="btn btn-primary btn-sm">+ Add Product</Link>}
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Flags</th><th>Actions</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.sku || '—'}</td>
                <td>{formatPrice(p.sellingPrice)}</td>
                <td className={p.stock <= 5 ? 'alert-text' : ''}>{p.stock}</td>
                <td>
                  {p.isFeatured && <span className="badge">Featured</span>}
                  {p.isBestSeller && <span className="badge">Best</span>}
                </td>
                <td className="admin-actions-cell">
                  {isAdmin && <Link to={`/admin/products/${p._id}/edit`} className="btn btn-sm btn-outline">Edit</Link>}
                  {isAdmin && <button type="button" className="btn btn-sm btn-outline" onClick={() => handleDuplicate(p._id)}>Copy</button>}
                  {isAdmin && <button type="button" className="btn btn-sm danger-text" onClick={() => handleDelete(p._id)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
