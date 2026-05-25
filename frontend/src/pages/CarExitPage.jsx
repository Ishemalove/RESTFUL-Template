import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Pagination } from '../components/Pagination';
import { entryApi } from '../api/client';

export default function CarExitPage() {
  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [bill, setBill] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function load(page = 1) {
    entryApi.active(page, 10).then((res) => {
      setEntries(res.data);
      setPagination(res.pagination);
    });
  }

  useEffect(() => load(1), []);

  async function handleExit(entryId) {
    setError('');
    setBill(null);
    setLoading(true);
    try {
      const res = await entryApi.exit({ entryId });
      setBill(res.data.bill);
      load(pagination.page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <h1 className="page-title">Car Exit</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Active parked vehicles</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Plate</th>
                  <th>Parking</th>
                  <th>Entry</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr><td colSpan={4}>No active entries</td></tr>
                ) : (
                  entries.map((e) => (
                    <tr key={e.id}>
                      <td>{e.plateNumber}</td>
                      <td>{e.parking?.code}</td>
                      <td>{new Date(e.entryDateTime).toLocaleString()}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ height: 36, width: 'auto' }}
                          disabled={loading}
                          onClick={() => handleExit(e.id)}
                        >
                          Exit & Bill
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={load}
          />
        </div>
        {bill && (
          <div className="bill">
            <h3>Parking Bill</h3>
            <dl>
              <dt>Bill ID</dt><dd>{bill.billId}</dd>
              <dt>Plate</dt><dd>{bill.plateNumber}</dd>
              <dt>Parking</dt><dd>{bill.parkingCode} — {bill.parkingName}</dd>
              <dt>Entry</dt><dd>{new Date(bill.entryDateTime).toLocaleString()}</dd>
              <dt>Exit</dt><dd>{new Date(bill.exitDateTime).toLocaleString()}</dd>
              <dt>Duration</dt><dd>{bill.duration}</dd>
              <dt>Rate</dt><dd>{bill.feePerHour} {bill.currency}/hr</dd>
              <dt>Total Charged</dt>
              <dd><strong>{bill.chargedAmount.toLocaleString()} {bill.currency}</strong></dd>
            </dl>
          </div>
        )}
      </div>
    </Layout>
  );
}
