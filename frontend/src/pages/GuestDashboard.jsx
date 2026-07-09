import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookingsApi } from '../api/bookingApi';

const paymentColors = {
  paid: 'bg-primary/10 text-primary',
  pending: 'bg-accent/10 text-accent',
  refunded: 'bg-error/10 text-error',
};

const GuestDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBookingsApi()
      .then((res) => setBookings(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center py-20 text-muted font-sans">Loading your bookings...</p>;

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto">
      <h1 className="font-display text-3xl font-semibold text-ink mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-display text-xl text-ink">No bookings yet</p>
          <p className="text-muted font-sans mt-1 text-sm">Once you reserve a stay, it'll show up here.</p>
          <Link to="/" className="inline-block mt-4 text-primary font-sans hover:underline">Browse stays →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs text-muted uppercase tracking-wide">{b.booking_reference}</p>
                  <p className="font-display text-lg text-ink font-semibold">{b.title}</p>
                  <p className="text-muted font-sans text-sm">{b.city}, {b.country}</p>
                </div>
                <span className={`font-mono text-xs px-2 py-1 rounded uppercase ${paymentColors[b.payment_status] || ''}`}>
                  {b.payment_status}
                </span>
              </div>
              <div className="relative">
                <div className="absolute -left-3 -top-3 w-6 h-6 bg-paper rounded-full"></div>
                <div className="absolute -right-3 -top-3 w-6 h-6 bg-paper rounded-full"></div>
                <div className="border-t-2 border-dashed border-border mx-3"></div>
              </div>
              <div className="p-5 flex items-center justify-between font-mono text-sm">
                <span className="text-ink">
                  {new Date(b.check_in).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  {' → '}
                  {new Date(b.check_out).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-ink font-semibold uppercase text-xs">{b.status}</span>
                <span className="text-accent font-semibold">₹{Number(b.total_price).toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuestDashboard;