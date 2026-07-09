import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPropertyByIdApi } from '../api/propertyApi';
import { createBookingApi, verifyPaymentApi } from '../api/bookingApi';
import { setCurrentBooking } from '../features/booking/bookingSlice';
import { showNotification } from '../features/notification/notificationSlice';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [property, setProperty] = useState(null);
  const [form, setForm] = useState({ checkIn: '', checkOut: '', numberOfGuests: 1 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getPropertyByIdApi(id)
      .then((res) => setProperty(res.data.data))
      .catch(() => dispatch(showNotification({ message: 'Property not found', type: 'error' })))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const nights = form.checkIn && form.checkOut
    ? Math.max(0, (new Date(form.checkOut) - new Date(form.checkIn)) / (1000 * 60 * 60 * 24))
    : 0;
  const estimatedTotal = property ? nights * property.price_per_night : 0;

  const handleReserve = async (e) => {
    e.preventDefault();

    if (nights <= 0) {
      dispatch(showNotification({ message: 'Check-out must be after check-in', type: 'error' }));
      return;
    }

    setSubmitting(true);
    try {
      // Step 1 — create booking on our backend (locks dates, creates Razorpay order)
      const res = await createBookingApi({
        propertyId: id,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        numberOfGuests: Number(form.numberOfGuests),
      });
      const booking = res.data.data;

      // Step 2 — open Razorpay checkout
      const options = {
        key: booking.razorpayKeyId,
        amount: Math.round(booking.totalPrice * 100),
        currency: 'INR',
        name: 'LuxeLodging',
        description: property.title,
        order_id: booking.razorpayOrderId,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: '#0B6E4F' },
        handler: async (response) => {
          try {
            await verifyPaymentApi({
              bookingId: booking.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            dispatch(setCurrentBooking({
              bookingReference: booking.bookingReference,
              propertyTitle: property.title,
              city: property.city,
              country: property.country,
              checkIn: booking.checkIn,
              checkOut: booking.checkOut,
              nights: booking.nights,
              totalPrice: booking.totalPrice,
              numberOfGuests: form.numberOfGuests,
            }));

            dispatch(showNotification({ message: 'Booking confirmed!', type: 'success' }));
            navigate('/booking-confirmation');
          } catch (err) {
                console.error('Verification error:', err.response?.data || err.message);
                dispatch(showNotification({
                    message: err.response?.data?.message || 'Payment succeeded but verification failed — contact support with your payment ID.',
                    type: 'error',
                }));
            }
        },
        modal: {
          ondismiss: () => {
            dispatch(showNotification({
              message: 'Payment cancelled. Your dates are held temporarily, but not confirmed.',
              type: 'info',
            }));
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        dispatch(showNotification({ message: 'Payment failed. Please try again.', type: 'error' }));
      });
      rzp.open();

    } catch (err) {
      dispatch(showNotification({
        message: err.response?.data?.message || 'Could not create booking',
        type: 'error',
      }));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center py-20 text-muted font-sans">Loading...</p>;
  if (!property) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="px-6 py-10 max-w-lg mx-auto">
      <h1 className="font-display text-3xl font-semibold text-ink">Reserve your stay</h1>
      <p className="text-muted font-sans mt-1">{property.title} — {property.city}, {property.country}</p>

      <form onSubmit={handleReserve} className="bg-white border border-border rounded-xl p-6 mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Check-in</label>
            <input
              type="date" name="checkIn" required min={today} value={form.checkIn} onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Check-out</label>
            <input
              type="date" name="checkOut" required min={form.checkIn || today} value={form.checkOut} onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Guests</label>
          <input
            type="number" name="numberOfGuests" min="1" max={property.guests_allowed}
            value={form.numberOfGuests} onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted font-sans mt-1">Max {property.guests_allowed} guests</p>
        </div>

        {nights > 0 && (
          <div className="border-t border-dashed border-border pt-4 font-mono text-sm">
            <div className="flex justify-between text-ink">
              <span>₹{Number(property.price_per_night).toLocaleString('en-IN')} × {nights} nights</span>
              <span>₹{estimatedTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-ink font-semibold mt-2 text-base">
              <span>Total</span>
              <span className="text-accent">₹{estimatedTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        <button
          type="submit" disabled={submitting || nights <= 0}
          className="w-full py-3 rounded-md bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {submitting ? 'Processing...' : 'Reserve & Pay'}
        </button>
      </form>
    </div>
  );
};

export default BookingPage;