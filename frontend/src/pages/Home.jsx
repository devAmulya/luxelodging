import { useState, useEffect } from 'react';
import { searchPropertiesApi } from '../api/propertyApi';
import SearchBar from '../components/SearchBar';
import PropertyCard from '../components/PropertyCard';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchProperties = async (filters = {}) => {
    setLoading(true);
    try {
      const res = await searchPropertiesApi(filters);
      setProperties(res.data.data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSearch = (filters) => {
    setHasSearched(true);
    fetchProperties(filters);
  };

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl font-semibold text-ink">Find your next stay</h1>
        <p className="text-muted font-sans mt-1">Real places, hosted by real people</p>
      </div>

      <div className="relative mb-12">
        <SearchBar onSearch={handleSearch} />
      </div>

      {loading ? (
        <p className="text-center text-muted font-sans">Loading stays...</p>
      ) : properties.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-display text-xl text-ink">
            {hasSearched ? 'No stays match these filters' : 'No properties listed yet'}
          </p>
          <p className="text-muted font-sans mt-1 text-sm">
            {hasSearched ? 'Try widening your dates, price range, or location.' : 'Check back once hosts start listing.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;