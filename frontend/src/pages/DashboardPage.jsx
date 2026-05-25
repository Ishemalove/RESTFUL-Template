import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { reportApi } from '../api/client';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [occupancy, setOccupancy] = useState([]);

  useEffect(() => {
    if (!isAdmin) return;
    reportApi.occupancy().then((res) => setOccupancy(res.data)).catch(() => {});
  }, [isAdmin]);

  return (
    <Layout>
      <h1 className="page-title">Welcome, {user?.firstName}</h1>
      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem' }}>Quick Actions</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><Link to="/parkings">View available parkings</Link></li>
            <li><Link to="/entries/new">Register car entry</Link></li>
            <li><Link to="/entries/exit">Process car exit</Link></li>
            {isAdmin && (
              <>
                <li><Link to="/parkings/register">Register new parking</Link></li>
                <li><Link to="/reports">View reports</Link></li>
              </>
            )}
          </ul>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem' }}>Your Profile</h3>
          <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p>
            <strong>Role:</strong>{' '}
            <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-attendant'}`}>
              {user?.role?.replace('_', ' ')}
            </span>
          </p>
        </div>
      </div>
      {isAdmin && occupancy.length > 0 && (
        <>
          <h2 className="page-title" style={{ fontSize: '1.25rem', marginTop: '2rem' }}>
            Real-time occupancy by location
          </h2>
          <div className="stats">
            {occupancy.map((o) => (
              <div key={o.parkingCode} className="stat-card">
                <div className="value">{o.carsCurrentlyParked}</div>
                <div className="label">{o.parkingName}</div>
                <div className="label" style={{ marginTop: '0.25rem' }}>
                  {o.availableSpaces} spaces free
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}
