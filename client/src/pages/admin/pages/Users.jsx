import { useEffect, useState } from 'react';
import { adminAPI } from '../../../services';
import { showToast } from '../../../components/common/Toast';

const Users = () => {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  const load = () => adminAPI.getStaff().then(({ data }) => setStaff(data.data));

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await adminAPI.createStaff(form);
    showToast('Staff created');
    setForm({ name: '', email: '', password: '', phone: '' });
    load();
  };

  return (
    <div>
      <div className="admin-page-header"><h1>Admin Users</h1></div>
      <form className="admin-filters" onSubmit={create}>
        <input className="form-control" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="form-control" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="form-control" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="form-control" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="btn btn-primary btn-sm">Create Staff</button>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
          <tbody>
            {staff.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
