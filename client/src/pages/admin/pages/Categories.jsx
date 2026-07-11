import { useEffect, useState } from 'react';
import { categoryAPI } from '../../../services';
import { showToast } from '../../../components/common/Toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', sortOrder: 0 });

  const load = () => categoryAPI.getAll().then(({ data }) => setCategories(data.data));

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('sortOrder', form.sortOrder);
    await categoryAPI.create(fd);
    showToast('Category created');
    setForm({ name: '', description: '', sortOrder: 0 });
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete category?')) return;
    await categoryAPI.delete(id);
    showToast('Deleted');
    load();
  };

  return (
    <div>
      <div className="admin-page-header"><h1>Categories</h1></div>
      <form className="admin-filters" onSubmit={create}>
        <input className="form-control" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="form-control" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="btn btn-primary btn-sm">Add Category</button>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Slug</th><th>Sort</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.slug}</td>
                <td>{c.sortOrder}</td>
                <td>{c.isActive ? 'Yes' : 'No'}</td>
                <td><button type="button" className="btn btn-sm danger-text" onClick={() => remove(c._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Categories;
