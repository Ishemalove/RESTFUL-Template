import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { parkingApi } from '../api/client';

export default function RegisterParkingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: '',
    name: '',
    numberOfSpaces: '',
    location: '',
    feePerHour: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await parkingApi.create({
        ...form,
        numberOfSpaces: parseInt(form.numberOfSpaces, 10),
        feePerHour: parseFloat(form.feePerHour),
      });
      setSuccess('Parking registered successfully');
      setTimeout(() => navigate('/parkings'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <h1 className="page-title">Register Parking</h1>
      <div className="card" style={{ maxWidth: 560 }}>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Parking Code</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="KG-003"
              required
            />
          </div>
          <div className="form-group">
            <label>Parking Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Number of Spaces</label>
            <input
              type="number"
              min="1"
              value={form.numberOfSpaces}
              onChange={(e) => setForm({ ...form, numberOfSpaces: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Charging Fee per Hour (RWF)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.feePerHour}
              onChange={(e) => setForm({ ...form, feePerHour: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Register Parking'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
