import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { entryApi, parkingApi } from '../api/client';

export default function CarEntryPage() {
  const [parkings, setParkings] = useState([]);
  const [form, setForm] = useState({ plateNumber: '', parkingCode: '', entryDateTime: '' });
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    parkingApi.list(1, 100).then((res) => setParkings(res.data)).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setTicket(null);
    setLoading(true);
    try {
      const body = {
        plateNumber: form.plateNumber,
        parkingCode: form.parkingCode,
      };
      if (form.entryDateTime) body.entryDateTime = new Date(form.entryDateTime).toISOString();
      const res = await entryApi.create(body);
      setTicket(res.data.ticket);
      setForm({ plateNumber: '', parkingCode: '', entryDateTime: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <h1 className="page-title">Car Entry</h1>
      <div className="grid-2">
        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Plate Number</label>
              <input
                value={form.plateNumber}
                onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
                placeholder="RAB 123 A"
                required
              />
            </div>
            <div className="form-group">
              <label>Parking</label>
              <select
                value={form.parkingCode}
                onChange={(e) => setForm({ ...form, parkingCode: e.target.value })}
                required
              >
                <option value="">Select parking</option>
                {parkings.map((p) => (
                  <option key={p.id} value={p.code} disabled={p.availableSpaces <= 0}>
                    {p.code} — {p.name} ({p.availableSpaces} free) — {p.feePerHour} RWF/hr
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Entry Date Time (optional)</label>
              <input
                type="datetime-local"
                value={form.entryDateTime}
                onChange={(e) => setForm({ ...form, entryDateTime: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Register Entry & Print Ticket'}
            </button>
          </form>
        </div>
        {ticket && (
          <div className="ticket">
            <h3>Parking Ticket</h3>
            <dl>
              <dt>Ticket ID</dt><dd>{ticket.ticketId}</dd>
              <dt>Plate</dt><dd>{ticket.plateNumber}</dd>
              <dt>Parking</dt><dd>{ticket.parkingCode} — {ticket.parkingName}</dd>
              <dt>Location</dt><dd>{ticket.location}</dd>
              <dt>Entry Time</dt><dd>{new Date(ticket.entryDateTime).toLocaleString()}</dd>
              <dt>Rate</dt><dd>{ticket.feePerHour} RWF / hour</dd>
            </dl>
            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--muted)' }}>{ticket.message}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
