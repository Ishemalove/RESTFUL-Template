import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Pagination } from '../components/Pagination';
import { parkingApi } from '../api/client';

export default function ParkingsPage() {
  const [parkings, setParkings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  function load(page = 1) {
    setLoading(true);
    parkingApi
      .list(page)
      .then((res) => {
        setParkings(res.data);
        setPagination(res.pagination);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => load(1), []);

  return (
    <Layout>
      <h1 className="page-title">Available Parkings</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Available</th>
                  <th>Fee/hour (RWF)</th>
                </tr>
              </thead>
              <tbody>
                {parkings.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.code}</strong></td>
                    <td>{p.name}</td>
                    <td>{p.location}</td>
                    <td>
                      <span className={p.availableSpaces > 0 ? 'badge badge-available' : 'badge badge-full'}>
                        {p.availableSpaces} / {p.totalSpaces}
                      </span>
                    </td>
                    <td>{p.feePerHour.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={load}
          />
        </div>
      )}
    </Layout>
  );
}
