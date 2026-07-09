const Star = ({ filled }) => (
  <span className={filled ? 'text-accent' : 'text-border'}>★</span>
);

const ReviewsList = ({ data }) => {
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
            <div className="my-1">
              {[1, 2, 3, 4, 5].map((n) => <Star key={n} filled={n <= review.rating} />)}
            </div>
            {review.comment && <p className="text-sm text-ink font-sans">{review.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;