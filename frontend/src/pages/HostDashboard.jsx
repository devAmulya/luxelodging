import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getMyPropertiesApi, deletePropertyApi } from '../api/propertyApi';
import { getHostBookingsApi } from '../api/bookingApi';
import { showNotification } from '../features/notification/notificationSlice';

const HostDashboard = () => {
  const [tab, setTab] = useState('listings');
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    setLoading(true);
    if (tab === 'listings') {
      getMyPropertiesApi().then((res) => setProperties(res.data.data)).finally(() => setLoading(false));
    } else {
      getHostBookingsApi().then((res) => setBookings(res.data.data)).finally(() => setLoading(false));
    }
  }, [tab]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property? This cannot be undone.')) return;
    try {
      await deletePropertyApi(id);
      dispatch(showNotification({ message: 'Property deleted', type: 'success' }));
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      dispatch(showNotification({ message: err.response?.data?.message || 'Delete failed', type: 'error' }));
    }
  };

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">Host Dashboard</h1>
        <Link
          to="/host/properties/new"
          className="px-4 py-2 rounded-md bg-primary text-white font-sans text-sm hover:bg-primary-dark transition-colors"
        >
          + Add property
        </Link>
      </div>

      <div className="flex gap-1 border-b border-border mb-6">
        {['listings', 'bookings'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 font-sans text-sm capitalize border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-primary text-primary font-medium' : 'border-transparent text-muted'
            }`}
          >
            {t === 'listings' ? 'My Listings' : 'Bookings Received'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center py-16 text-muted font-sans">Loading...</p>
      ) : tab === 'listings' ? (
        properties.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-display text-xl text-ink">No properties listed yet</p>
            <p className="text-muted font-sans mt-1 text-sm">Add your first property to start hosting.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {properties.map((p) => (
              <div key={p.id} className="bg-white border border-border rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-display text-lg text-ink font-semibold">{p.title}</p>
                    <p className="text-muted font-sans text-sm">{p.city}, {p.country}</p>
                    <p className="font-mono text-accent text-sm mt-1">
                      ₹{Number(p.price_per_night).toLocaleString('en-IN')} / night
                    </p>
                  </div>
                  <span className={`font-mono text-xs px-2 py-1 rounded uppercase ${p.is_active ? 'bg-primary/10 text-primary' : 'bg-muted/10 text-muted'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2 mt-4 font-sans text-sm">
                  <Link
                    to={`/host/properties/${p.id}/edit`}
                    className="flex-1 text-center py-1.5 rounded-md border border-border text-ink hover:bg-paper transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="flex-1 py-1.5 rounded-md border border-error/30 text-error hover:bg-error/5 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : bookings.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-display text-xl text-ink">No bookings yet</p>
          <p className="text-muted font-sans mt-1 text-sm">Bookings on your properties will show up here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white border border-border rounded-xl p-4 flex items-center justify-between font-sans text-sm">
              <div>
                <p className="font-mono text-xs text-muted uppercase">{b.booking_reference}</p>
                <p className="text-ink font-medium">{b.title}</p>
                <p className="text-muted text-xs">{b.guest_name} · {b.guest_email}</p>
              </div>
              <div className="text-right font-mono text-xs">
                <p className="text-ink">
                  {new Date(b.check_in).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  {' → '}
                  {new Date(b.check_out).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
                <p className="text-accent font-semibold mt-1">₹{Number(b.total_price).toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostDashboard;