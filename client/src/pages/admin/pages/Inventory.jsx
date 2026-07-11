import { useEffect, useState } from 'react';
import { adminAPI } from '../../../services';
import { showToast } from '../../../components/common/Toast';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState({ productId: '', quantity: '', reason: '' });

  const load = () => adminAPI.getInventory().then(({ data }) => setInventory(data.data));

  useEffect(() => { load(); }, []);

  const stockIn = async (e) => {
    e.preventDefault();
    await adminAPI.stockIn({ productId: form.productId, quantity: +form.quantity, reason: form.reason });
    showToast('Stock added');
    load();
  };

  const stockOut = async (productId) => {
    const qty = prompt('Quantity to remove:');
    if (!qty) return;
    await adminAPI.stockOut({ productId, quantity: +qty, reason: 'Manual stock out' });
    showToast('Stock removed');
    load();
  };

  return (
    <div>
      <div className="admin-page-header"><h1>Inventory</h1></div>
      <form className="admin-filters" onSubmit={stockIn}>
        <select className="form-control" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} required>
          <option value="">Select product</option>
          {inventory.map((i) => <option key={i._id} value={i.product?._id}>{i.product?.name}</option>)}
        </select>
        <input className="form-control" type="number" placeholder="Qty" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
        <input className="form-control" placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        <button className="btn btn-primary btn-sm">Stock In</button>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Updated</th><th></th></tr></thead>
          <tbody>
            {inventory.map((i) => (
              <tr key={i._id} className={i.currentStock <= 5 ? 'low-stock' : ''}>
                <td>{i.product?.name}</td>
                <td>{i.product?.sku}</td>
                <td>{i.currentStock}</td>
                <td>{new Date(i.updatedAt).toLocaleDateString('en-IN')}</td>
                <td><button type="button" className="btn btn-sm btn-outline" onClick={() => stockOut(i.product?._id)}>Stock Out</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
