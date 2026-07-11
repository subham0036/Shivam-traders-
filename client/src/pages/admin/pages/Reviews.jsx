import { useEffect, useState } from 'react';
import { reviewAPI } from '../../../services';
import { showToast } from '../../../components/common/Toast';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);

  const load = () => reviewAPI.getAllAdmin().then(({ data }) => setReviews(data.data));

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    await reviewAPI.moderate(id, { isApproved: true });
    showToast('Approved');
    load();
  };

  const reject = async (id) => {
    await reviewAPI.moderate(id, { isApproved: false });
    showToast('Rejected');
    load();
  };

  const remove = async (id) => {
    await reviewAPI.deleteAdmin(id);
    load();
  };

  return (
    <div>
      <div className="admin-page-header"><h1>Reviews</h1></div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Product</th><th>User</th><th>Rating</th><th>Comment</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r._id}>
                <td>{r.product?.name}</td>
                <td>{r.name}</td>
                <td>{'★'.repeat(r.rating)}</td>
                <td>{r.comment?.slice(0, 60)}...</td>
                <td>{r.isApproved ? 'Approved' : 'Pending'}</td>
                <td>
                  {!r.isApproved && <button type="button" className="btn btn-sm btn-primary" onClick={() => approve(r._id)}>Approve</button>}
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => reject(r._id)}>Reject</button>
                  <button type="button" className="btn btn-sm danger-text" onClick={() => remove(r._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reviews;
