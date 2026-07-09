import { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    city: '', checkIn: '', checkOut: '', guests: '', minPrice: '', maxPrice: ''
  });
  const [showMore, setShowMore] = useState(false);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-border rounded-full px-2 py-2 flex items-center gap-1 shadow-sm max-w-3xl mx-auto">
      <div className="flex-1 px-4">
        <label className="block text-xs font-mono uppercase text-muted">Where</label>
        <input
          type="text" name="city" value={filters.city} onChange={handleChange}
          placeholder="Delhi, Goa..."
          className="w-full text-sm font-sans focus:outline-none text-ink placeholder:text-muted"
        />
      </div>
      <div className="w-px h-8 border-l border-dashed border-border"></div>

      <div className="flex-1 px-4">
        <label className="block text-xs font-mono uppercase text-muted">Check-in</label>
        <input
          type="date" name="checkIn" value={filters.checkIn} onChange={handleChange}
          className="w-full text-sm font-sans focus:outline-none text-ink"
        />
      </div>
      <div className="w-px h-8 border-l border-dashed border-border"></div>

      <div className="flex-1 px-4">
        <label className="block text-xs font-mono uppercase text-muted">Check-out</label>
        <input
          type="date" name="checkOut" value={filters.checkOut} onChange={handleChange}
          className="w-full text-sm font-sans focus:outline-none text-ink"
        />
      </div>
      <div className="w-px h-8 border-l border-dashed border-border"></div>

      <div className="w-24 px-4">
        <label className="block text-xs font-mono uppercase text-muted">Guests</label>
        <input
          type="number" name="guests" min="1" value={filters.guests} onChange={handleChange}
          placeholder="1"
          className="w-full text-sm font-sans focus:outline-none text-ink placeholder:text-muted"
        />
      </div>

      <button
        type="submit"
        className="bg-primary text-white rounded-full px-6 py-3 text-sm font-medium hover:bg-primary-dark transition-colors"
      >
        Search
      </button>

      <button
        type="button"
        onClick={() => setShowMore(!showMore)}
        className="text-muted text-xs underline px-2"
      >
        {showMore ? 'Less' : 'More'}
      </button>

      {showMore && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-border rounded-lg p-4 flex gap-3 shadow-md">
          <input
            type="number" name="minPrice" value={filters.minPrice} onChange={handleChange}
            placeholder="Min price"
            className="border border-border rounded-md px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="number" name="maxPrice" value={filters.maxPrice} onChange={handleChange}
            placeholder="Max price"
            className="border border-border rounded-md px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}
    </form>
  );
};

export default SearchBar;