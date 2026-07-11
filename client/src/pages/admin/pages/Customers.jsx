import { useEffect, useState } from 'react';
import { adminAPI } from '../../../services';
import { formatPrice } from '../../../utils/helpers';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { adminAPI.getCustomers().then(({ data }) => setCustomers(data.data)); }, []);

  const filtered = customers.filter((c) =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBlock = async (id) => {
    await adminAPI.toggleBlock(id);
    const { data } = await adminAPI.getCustomers();
    setCustomers(data.data);
  };

  return (
    <div>
      <div className="admin-page-header"><h1>Customers</h1></div>
      <input className="form-control admin-search-single" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Spent</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone || '—'}</td>
                <td>{formatPrice(c.totalPurchases)}</td>
                <td>{c.isBlocked ? 'Blocked' : 'Active'}</td>
                <td><button type="button" className="btn btn-sm btn-outline" onClick={() => toggleBlock(c._id)}>{c.isBlocked ? 'Unblock' : 'Block'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
