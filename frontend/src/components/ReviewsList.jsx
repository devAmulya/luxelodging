import { useSelector, useDispatch } from 'react-redux';
import { deleteReviewApi } from '../api/reviewApi';
import { showNotification } from '../features/notification/notificationSlice';

const Star = ({ filled }) => (
  <span className={filled ? 'text-accent' : 'text-border'}>★</span>
);

const ReviewsList = ({ data, onDeleted }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    try {
      await deleteReviewApi(reviewId);
      dispatch(showNotification({ message: 'Review deleted', type: 'success' }));
      onDeleted();
    } catch (err) {
      dispatch(showNotification({ message: err.response?.data?.message || 'Could not delete review', type: 'error' }));
    }
  };

  if (!data || data.totalReviews === 0) {
    return (
      <p className="text-muted font-sans text-sm">No reviews yet — be the first to stay here.</p>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="font-display text-xl text-ink">{data.averageRating}</span>
        <div>{[1, 2, 3, 4, 5].map((n) => <Star key={n} filled={n <= Math.round(data.averageRating)} />)}</div>
        <span className="text-muted font-sans text-sm">({data.totalReviews} reviews)</span>
      </div>

      <div className="space-y-4">
        {data.reviews.map((review) => (
          <div key={review._id} className="border-t border-dashed border-border pt-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-ink font-sans text-sm">{review.guestName}</span>
              <span className="font-mono text-xs text-muted">
                {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="my-1 flex items-center justify-between">
              <div>{[1, 2, 3, 4, 5].map((n) => <Star key={n} filled={n <= review.rating} />)}</div>
              {user?.id === review.guestId && (
                <button
                  onClick={() => handleDelete(review._id)}
                  className="text-xs text-error font-sans hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
            {review.comment && <p className="text-sm text-ink font-sans">{review.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;