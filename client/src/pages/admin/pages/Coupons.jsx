import { useEffect, useState } from 'react';
import { adminAPI } from '../../../services';
import { formatPrice } from '../../../utils/helpers';
import { showToast } from '../../../components/common/Toast';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: '', type: 'percentage', value: 10, minOrderAmount: 500 });

  const load = () => adminAPI.getCoupons().then(({ data }) => setCoupons(data.data));

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await adminAPI.createCoupon(form);
    showToast('Coupon created');
    load();
  };

  const toggle = async (c) => {
    await adminAPI.updateCoupon(c._id, { isActive: !c.isActive });
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete coupon?')) return;
    await adminAPI.deleteCoupon(id);
    load();
  };

  return (
    <div>
      <div className="admin-page-header"><h1>Coupons</h1></div>
      <form className="admin-filters" onSubmit={create}>
        <input className="form-control" placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
        <select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="percentage">%</option><option value="flat">Flat ₹</option>
        </select>
        <input className="form-control" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: +e.target.value })} />
        <button className="btn btn-primary btn-sm">Create</button>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Used</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id}>
                <td>{c.code}</td>
                <td>{c.type}</td>
                <td>{c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}</td>
                <td>{c.usedCount}/{c.usageLimit || '∞'}</td>
                <td>{c.isActive ? 'Yes' : 'No'}</td>
                <td>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => toggle(c)}>Toggle</button>
                  <button type="button" className="btn btn-sm danger-text" onClick={() => remove(c._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Coupons;
