import { Link } from 'react-router-dom';

const PropertyCard = ({ property }) => {
  return (
    <Link
      to={`/properties/${property.id}`}
      className="block bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="h-48 bg-border">
        {property.cover_image ? (
          <img
            src={property.cover_image}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted font-sans text-sm">
            No photo yet
          </div>
        )}
      </div>

      {/* Perforation divider with punched holes */}
      <div className="relative">
        <div className="absolute -left-3 -top-3 w-6 h-6 bg-paper rounded-full"></div>
        <div className="absolute -right-3 -top-3 w-6 h-6 bg-paper rounded-full"></div>
        <div className="border-t-2 border-dashed border-border mx-3"></div>
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-ink truncate">
          {property.title}
        </h3>
        <p className="text-sm text-muted font-sans mt-0.5">
          {property.city}, {property.country}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-mono text-accent font-medium">
            ₹{Number(property.price_per_night).toLocaleString('en-IN')}
            <span className="text-muted text-xs"> / night</span>
          </span>
          <span className="text-xs font-mono text-muted uppercase">
            {property.guests_allowed} guests
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;