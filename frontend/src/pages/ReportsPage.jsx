import { useState } from 'react';
import { Layout } from '../components/Layout';
import { Pagination } from '../components/Pagination';
import { reportApi } from '../api/client';

function toLocalInput(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const defaultEnd = new Date();
const defaultStart = new Date();
defaultStart.setDate(defaultStart.getDate() - 7);

export default function ReportsPage() {
  const [range, setRange] = useState({
    startDateTime: toLocalInput(defaultStart),
    endDateTime: toLocalInput(defaultEnd),
    parkingCode: '',
  });
  const [tab, setTab] = useState('outgoing');
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load(page = 1) {
    setError('');
    setLoading(true);
    const params = {
      startDateTime: new Date(range.startDateTime).toISOString(),
      endDateTime: new Date(range.endDateTime).toISOString(),
      page,
      limit: 10,
    };
    if (range.parkingCode) params.parkingCode = range.parkingCode;

    try {
      const res =
        tab === 'outgoing'
          ? await reportApi.outgoing(params)
          : await reportApi.entered(params);
      setData(res.data);
      setSummary(res.summary);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <h1 className="page-title">Reports</h1>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn ${tab === 'outgoing' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: 'auto' }}
            onClick={() => setTab('outgoing')}
          >
            Outgoing (with charges)
          </button>
          <button
            type="button"
            className={`btn ${tab === 'entered' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: 'auto' }}
            onClick={() => setTab('entered')}
          >
            Entered cars
          </button>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label>Start Date Time</label>
            <input
              type="datetime-local"
              value={range.startDateTime}
              onChange={(e) => setRange({ ...range, startDateTime: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>End Date Time</label>
            <input
              type="datetime-local"
              value={range.endDateTime}
              onChange={(e) => setRange({ ...range, endDateTime: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Parking Code (optional)</label>
            <input
              value={range.parkingCode}
              onChange={(e) => setRange({ ...range, parkingCode: e.target.value })}
              placeholder="KG-001"
            />
          </div>
        </div>
        <button type="button" className="btn btn-primary" style={{ maxWidth: 200 }} onClick={() => load(1)} disabled={loading}>
          {loading ? 'Loading...' : 'Generate Report'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {summary && (
        <div className="stats">
          <div className="stat-card">
            <div className="value">{summary.count}</div>
            <div className="label">Total records</div>
          </div>
          {tab === 'outgoing' && summary.totalCharged !== undefined && (
            <div className="stat-card">
              <div className="value">{summary.totalCharged.toLocaleString()}</div>
              <div className="label">Total charged (RWF)</div>
            </div>
          )}
        </div>
      )}

      {data.length > 0 && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Plate</th>
                  <th>Parking</th>
                  <th>Entry</th>
                  {tab === 'outgoing' && <th>Exit</th>}
                  {tab === 'outgoing' && <th>Charged (RWF)</th>}
                </tr>
              </thead>
              <tbody>
                {data.map((e) => (
                  <tr key={e.id}>
                    <td>{e.plateNumber}</td>
                    <td>{e.parking?.code}</td>
                    <td>{new Date(e.entryDateTime).toLocaleString()}</td>
                    {tab === 'outgoing' && (
                      <>
                        <td>{e.exitDateTime ? new Date(e.exitDateTime).toLocaleString() : '—'}</td>
                        <td>{e.chargedAmount?.toLocaleString()}</td>
                      </>
                    )}
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
