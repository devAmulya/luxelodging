import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getMyBookingsApi, cancelBookingApi } from '../api/bookingApi';
import { createReviewApi } from '../api/reviewApi';
import { showNotification } from '../features/notification/notificationSlice';

const paymentColors = {
  paid: 'bg-primary/10 text-primary',
  pending: 'bg-accent/10 text-accent',
  refunded: 'bg-error/10 text-error',
};

const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className={`text-2xl leading-none ${n <= value ? 'text-accent' : 'text-border'}`}
        aria-label={`${n} stars`}
      >
        ★
      </button>
    ))}
  </div>
);

const ReviewForm = ({ booking, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      dispatch(showNotification({ message: 'Please select a star rating', type: 'error' }));
      return;
    }
    setSubmitting(true);
    try {
      await createReviewApi({
        propertyId: booking.property_id,
        bookingId: booking.id,
        rating,
        comment: comment.trim() || undefined,
      });
      dispatch(showNotification({ message: 'Review submitted — thank you!', type: 'success' }));
      onSubmitted(booking.id);
    } catch (err) {
      dispatch(showNotification({ message: err.response?.data?.message || 'Could not submit review', type: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-5 pb-4 space-y-2 border-t border-border pt-3">
      <StarPicker value={rating} onChange={setRating} />
      <textarea
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        placeholder="How was your stay? (optional)"
        className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-1.5 rounded-md bg-primary text-white text-sm font-sans hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit review'}
      </button>
    </form>
  );
};

const GuestDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewFormFor, setReviewFormFor] = useState(null);
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const dispatch = useDispatch();

  useEffect(() => {
    getMyBookingsApi()
      .then((res) => setBookings(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking? This cannot be undone.')) return;
    try {
      await cancelBookingApi(bookingId);
      dispatch(showNotification({ message: 'Booking cancelled', type: 'success' }));
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b)));
    } catch (err) {
      dispatch(showNotification({ message: err.response?.data?.message || 'Could not cancel booking', type: 'error' }));
    }
  };

  const handleReviewed = (bookingId) => {
    setReviewedIds((prev) => new Set(prev).add(bookingId));
    setReviewFormFor(null);
  };

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
              <Link to={`/properties/${b.property_id}`} className="block p-5 hover:bg-paper/60 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs text-muted uppercase tracking-wide">{b.booking_reference}</p>
                    <p className="font-display text-lg text-ink font-semibold">{b.title}</p>
                    <p className="text-muted font-sans text-sm">{b.city}, {b.country}</p>
                  </div>
                  <span className={`font-mono text-xs px-2 py-1 rounded uppercase ${paymentColors[b.payment_status] || ''}`}>
                    {b.payment_status}
                  </span>
                </div>
              </Link>

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
                <span className={`font-semibold uppercase text-xs ${b.status === 'cancelled' ? 'text-error' : 'text-ink'}`}>
                  {b.status}
                </span>
                <span className="text-accent font-semibold">₹{Number(b.total_price).toLocaleString('en-IN')}</span>
              </div>

              {b.payment_status === 'pending' && b.status !== 'cancelled' && (
                <div className="px-5 pb-4">
                  <button
                    onClick={() => handleCancel(b.id)}
                    className="w-full py-2 rounded-md border border-error/30 text-error text-sm font-sans hover:bg-error/5 transition-colors"
                  >
                    Cancel booking
                  </button>
                </div>
              )}

              {b.status === 'completed' && !reviewedIds.has(b.id) && (
                reviewFormFor === b.id ? (
                  <ReviewForm booking={b} onSubmitted={handleReviewed} />
                ) : (
                  <div className="px-5 pb-4">
                    <button
                      onClick={() => setReviewFormFor(b.id)}
                      className="w-full py-2 rounded-md border border-border text-ink text-sm font-sans hover:bg-paper transition-colors"
                    >
                      ★ Leave a review
                    </button>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuestDashboard;