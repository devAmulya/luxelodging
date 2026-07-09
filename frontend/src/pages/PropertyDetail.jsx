import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPropertyByIdApi } from '../api/propertyApi';
import { getReviewsApi } from '../api/reviewApi';
import { getCalendarApi } from '../api/bookingApi';
import ImageGallery from '../components/ImageGallery';
import ReviewsList from '../components/ReviewsList';
import BookedCalendar from '../components/BookedCalendar';

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [propRes, reviewRes, calRes] = await Promise.all([
          getPropertyByIdApi(id),
          getReviewsApi(id),
          getCalendarApi(id),
        ]);
        setProperty(propRes.data.data);
        setReviews(reviewRes.data.data);
        setBookedDates(calRes.data.data.bookedDates);
      } catch (err) {
        setError('This property could not be found.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  if (loading) return <p className="text-center py-20 text-muted font-sans">Loading...</p>;
  if (error) return <p className="text-center py-20 text-error font-sans">{error}</p>;

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto">
      <ImageGallery images={property.images} title={property.title} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-8">
        {/* Left: Info */}
        <div className="lg:col-span-2">
          <h1 className="font-display text-3xl font-semibold text-ink">{property.title}</h1>
          <p className="text-muted font-sans mt-1">{property.city}, {property.country}</p>

          <div className="flex gap-4 mt-4 font-mono text-sm text-ink">
            <span>{property.bedrooms} bedroom{property.bedrooms !== 1 ? 's' : ''}</span>
            <span>·</span>
            <span>{property.beds} bed{property.beds !== 1 ? 's' : ''}</span>
            <span>·</span>
            <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
            <span>·</span>
            <span>up to {property.guests_allowed} guests</span>
          </div>

          <div className="border-t border-dashed border-border my-6"></div>

          <p className="font-sans text-ink leading-relaxed">
            {property.description || 'No description provided yet.'}
          </p>

          {bookedDates.length > 0 && (
            <>
              <div className="border-t border-dashed border-border my-6"></div>
              <h3 className="font-display text-lg text-ink mb-3">Availability</h3>
              <BookedCalendar bookedDates={bookedDates} />
            </>
          )}

          <div className="border-t border-dashed border-border my-6"></div>
          <h3 className="font-display text-lg text-ink mb-4">Reviews</h3>
          <ReviewsList data={reviews} />
        </div>

        {/* Right: Reserve panel */}
        <div>
          <div className="sticky top-6 bg-white border border-border rounded-xl p-5">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl text-accent font-medium">
                ₹{Number(property.price_per_night).toLocaleString('en-IN')}
              </span>
              <span className="text-muted font-sans text-sm">/ night</span>
            </div>

            <div className="border-t border-dashed border-border my-4"></div>

            <Link
              to={`/properties/${property.id}/book`}
              className="block text-center w-full py-3 rounded-md bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
            >
              Check dates & reserve
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;