import { useState, useRef, useEffect } from 'react';

const SearchBar = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    city: '', checkIn: '', checkOut: '', guests: '', minPrice: '', maxPrice: ''
  });
  const [showMore, setShowMore] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowMore(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowMore(false);
    onSearch(filters);
  };

  return (
    <div ref={wrapperRef} className="relative max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white border border-border rounded-full px-2 py-2 flex items-center gap-1 shadow-sm">
        <div className="flex-1 px-4 min-w-0">
          <label className="block text-xs font-mono uppercase text-muted">Where</label>
          <input
            type="text" name="city" value={filters.city} onChange={handleChange}
            placeholder="Delhi, Goa..."
            className="w-full text-sm font-sans focus:outline-none text-ink placeholder:text-muted bg-transparent"
          />
        </div>
        <div className="w-px h-8 border-l border-dashed border-border shrink-0"></div>

        <div className="flex-1 px-4 min-w-0">
          <label className="block text-xs font-mono uppercase text-muted">Check-in</label>
          <input
            type="date" name="checkIn" value={filters.checkIn} onChange={handleChange}
            className="w-full text-sm font-sans focus:outline-none text-ink bg-transparent"
          />
        </div>
        <div className="w-px h-8 border-l border-dashed border-border shrink-0"></div>

        <div className="flex-1 px-4 min-w-0">
          <label className="block text-xs font-mono uppercase text-muted">Check-out</label>
          <input
            type="date" name="checkOut" value={filters.checkOut} onChange={handleChange}
            className="w-full text-sm font-sans focus:outline-none text-ink bg-transparent"
          />
        </div>
        <div className="w-px h-8 border-l border-dashed border-border shrink-0"></div>

        <div className="w-20 px-4 shrink-0">
          <label className="block text-xs font-mono uppercase text-muted">Guests</label>
          <input
            type="number" name="guests" min="1" value={filters.guests} onChange={handleChange}
            placeholder="1"
            className="w-full text-sm font-sans focus:outline-none text-ink placeholder:text-muted bg-transparent"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className={`shrink-0 text-xs font-sans px-3 py-2 rounded-full border transition-colors ${
            showMore ? 'border-primary text-primary bg-primary/5' : 'border-border text-muted'
          }`}
        >
          More {(filters.minPrice || filters.maxPrice) && <span className="text-accent">•</span>}
        </button>

        <button
          type="submit"
          className="shrink-0 bg-primary text-white rounded-full px-6 py-3 text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Search
        </button>
      </form>

      {showMore && (
        <div className="absolute right-0 top-full mt-3 bg-white border border-border rounded-xl p-4 shadow-xl z-30 w-72">
          <div className="absolute -top-1.5 right-10 w-3 h-3 bg-white border-t border-l border-border rotate-45"></div>

          <p className="font-mono text-xs uppercase text-muted mb-3">Price range / night</p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs text-muted font-sans mb-1">Min</label>
              <div className="flex items-center border border-border rounded-md px-2">
                <span className="text-muted font-mono text-sm">₹</span>
                <input
                  type="number" name="minPrice" value={filters.minPrice} onChange={handleChange}
                  placeholder="0"
                  className="w-full px-2 py-2 text-sm font-mono focus:outline-none"
                />
              </div>
            </div>
            <span className="text-muted mt-5">–</span>
            <div className="flex-1">
              <label className="block text-xs text-muted font-sans mb-1">Max</label>
              <div className="flex items-center border border-border rounded-md px-2">
                <span className="text-muted font-mono text-sm">₹</span>
                <input
                  type="number" name="maxPrice" value={filters.maxPrice} onChange={handleChange}
                  placeholder="Any"
                  className="w-full px-2 py-2 text-sm font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowMore(false)}
            className="w-full mt-4 py-2 rounded-md bg-primary text-white text-sm font-sans hover:bg-primary-dark transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;