import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productAPI, categoryAPI } from '../../services';
import { GODS, MATERIALS } from '../../utils/helpers';
import { resolveMediaUrl } from '../../utils/invoice';
import { showToast } from '../../components/common/Toast';

const emptyForm = {
  name: '',
  description: '',
  shortDescription: '',
  category: '',
  godName: 'Ganesha',
  material: 'brass',
  height: 6,
  sellingPrice: '',
  mrp: '',
  stock: '',
  imageUrl: '',
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: false,
  isPremium: false,
  isActive: true,
};

const AdminProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    categoryAPI.getAll().then(({ data }) => setCategories(data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    productAPI.adminGetAll().then(({ data }) => {
      const product = data.data.find((p) => p._id === id);
      if (!product) {
        showToast('Product not found');
        navigate('/admin/products');
        return;
      }
      setForm({
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        category: product.category?._id || product.category || '',
        godName: product.godName || 'Ganesha',
        material: product.material || 'brass',
        height: product.height || 6,
        sellingPrice: product.sellingPrice || '',
        mrp: product.mrp || '',
        stock: product.stock || '',
        imageUrl: '',
        isFeatured: product.isFeatured || false,
        isBestSeller: product.isBestSeller || false,
        isNewArrival: product.isNewArrival || false,
        isPremium: product.isPremium || false,
        isActive: product.isActive !== false,
      });
      setExistingImages(product.images || []);
      setFetching(false);
    });
  }, [id, isEdit, navigate]);

  useEffect(() => () => {
    imagePreviews.forEach((url) => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
  }, [imagePreviews]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const previews = files.map((file) => URL.createObjectURL(file));
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...previews]);
    e.target.value = '';
  };

  const removeNewImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      if (prev[index]?.startsWith('blob:')) URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) return showToast('Please select a category');
    if (!imageFiles.length && !existingImages.length && !form.imageUrl.trim()) {
      return showToast('Please upload a photo or add an image URL');
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        shortDescription: form.shortDescription.trim(),
        category: form.category,
        godName: form.godName,
        material: form.material,
        height: Number(form.height),
        sellingPrice: Number(form.sellingPrice),
        mrp: Number(form.mrp),
        stock: Number(form.stock),
        discount: form.mrp > form.sellingPrice
          ? Math.round(((form.mrp - form.sellingPrice) / form.mrp) * 100)
          : 0,
        isFeatured: form.isFeatured,
        isBestSeller: form.isBestSeller,
        isNewArrival: form.isNewArrival,
        isPremium: form.isPremium,
        isActive: form.isActive,
      };

      if (isEdit && existingImages.length) {
        payload.images = existingImages;
      } else if (form.imageUrl.trim() && !imageFiles.length) {
        payload.images = [{ url: form.imageUrl.trim(), alt: form.name }];
      }

      const formData = new FormData();
      formData.append('data', JSON.stringify(payload));
      imageFiles.forEach((file) => formData.append('images', file));

      if (isEdit) {
        await productAPI.update(id, formData);
        showToast('Product updated');
      } else {
        await productAPI.create(formData);
        showToast('Product added');
      }
      navigate('/admin/products');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-spinner" />;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link to="/admin/products" className="admin-back-link">← Back to Products</Link>
          <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-card">
        <div className="admin-form-grid">
          <div className="form-group">
            <label>Product Name *</label>
            <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select className="form-control" name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Deity *</label>
            <select className="form-control" name="godName" value={form.godName} onChange={handleChange} required>
              {GODS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Material *</label>
            <select className="form-control" name="material" value={form.material} onChange={handleChange} required>
              {MATERIALS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Height (inches) *</label>
            <input className="form-control" type="number" name="height" value={form.height} onChange={handleChange} required min={1} />
          </div>
          <div className="form-group">
            <label>Selling Price (₹) *</label>
            <input className="form-control" type="number" name="sellingPrice" value={form.sellingPrice} onChange={handleChange} required min={1} />
          </div>
          <div className="form-group">
            <label>MRP (₹) *</label>
            <input className="form-control" type="number" name="mrp" value={form.mrp} onChange={handleChange} required min={1} />
          </div>
          <div className="form-group">
            <label>Stock Quantity *</label>
            <input className="form-control" type="number" name="stock" value={form.stock} onChange={handleChange} required min={0} />
          </div>
        </div>

        <div className="form-group">
          <label>Product Photos *</label>
          <div className="admin-image-upload">
            <label className="admin-upload-btn">
              <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.heic,.heif" multiple onChange={handleImageSelect} />
              Upload from phone / computer
            </label>
            <small className="form-hint">JPG, PNG, WEBP or HEIC. You can select multiple photos.</small>
          </div>

          {(existingImages.length > 0 || imagePreviews.length > 0) && (
            <div className="admin-image-preview-grid">
              {existingImages.map((img, index) => (
                <div key={`existing-${index}`} className="admin-image-preview">
                  <img src={resolveMediaUrl(img.url)} alt={img.alt || 'Product'} />
                  <button type="button" className="admin-image-remove" onClick={() => removeExistingImage(index)}>×</button>
                  <span className="admin-image-tag">Saved</span>
                </div>
              ))}
              {imagePreviews.map((preview, index) => (
                <div key={`new-${index}`} className="admin-image-preview">
                  <img src={preview} alt={`New upload ${index + 1}`} />
                  <button type="button" className="admin-image-remove" onClick={() => removeNewImage(index)}>×</button>
                  <span className="admin-image-tag">New</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Or paste Image URL (optional)</label>
          <input className="form-control" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." />
          <small className="form-hint">Use this only if you prefer a link instead of uploading a file.</small>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={4} required />
        </div>

        <div className="form-group">
          <label>Short Description</label>
          <input className="form-control" name="shortDescription" value={form.shortDescription} onChange={handleChange} />
        </div>

        <div className="admin-checkbox-grid">
          {[
            { name: 'isActive', label: 'Active on store' },
            { name: 'isFeatured', label: 'Featured' },
            { name: 'isBestSeller', label: 'Best Seller' },
            { name: 'isNewArrival', label: 'New Arrival' },
            { name: 'isPremium', label: 'Premium' },
          ].map((opt) => (
            <label key={opt.name} className="admin-checkbox">
              <input type="checkbox" name={opt.name} checked={form[opt.name]} onChange={handleChange} />
              {opt.label}
            </label>
          ))}
        </div>

        <div className="admin-form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/products')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
