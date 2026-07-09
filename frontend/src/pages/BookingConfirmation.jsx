import { useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';

const BookingConfirmation = () => {
  const booking = useSelector((state) => state.booking.currentBooking);

  if (!booking) return <Navigate to="/" replace />;

  return (
    <div className="px-6 py-16 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">Booking confirmed</h1>
        <p className="text-muted font-sans mt-1">Your stay is locked in — safe travels!</p>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="p-6">
          <p className="font-mono text-xs text-muted uppercase tracking-wide">Booking reference</p>
          <p className="font-mono text-xl text-primary font-medium">{booking.bookingReference}</p>
        </div>

        <div className="relative">
          <div className="absolute -left-3 -top-3 w-6 h-6 bg-paper rounded-full"></div>
          <div className="absolute -right-3 -top-3 w-6 h-6 bg-paper rounded-full"></div>
          <div className="border-t-2 border-dashed border-border mx-3"></div>
        </div>

        <div className="p-6 space-y-3 font-sans text-sm">
          <div>
            <p className="text-muted text-xs uppercase font-mono">Property</p>
            <p className="text-ink font-medium">{booking.propertyTitle}</p>
            <p className="text-muted text-xs">{booking.city}, {booking.country}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted text-xs uppercase font-mono">Check-in</p>
              <p className="text-ink font-mono">{new Date(booking.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-muted text-xs uppercase font-mono">Check-out</p>
              <p className="text-ink font-mono">{new Date(booking.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-dashed border-border pt-3">
            <span className="text-muted text-xs uppercase font-mono">{booking.numberOfGuests} guests · {booking.nights} nights</span>
            <span className="font-mono text-accent font-semibold">₹{Number(booking.totalPrice).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <Link
        to="/"
        className="block text-center mt-6 text-primary font-sans text-sm hover:underline"
      >
        ← Back to home
      </Link>
    </div>
  );
};

export default BookingConfirmation;