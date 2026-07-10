import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createPropertyApi, updatePropertyApi, getPropertyByIdApi, deletePropertyImageApi } from '../api/propertyApi';
import { showNotification } from '../features/notification/notificationSlice';
import ImageUploader from '../components/ImageUploader';
import LocationPicker from '../components/LocationPicker';
import LatLngInputs from '../components/LatLngInputs';

const emptyForm = {
  title: '', description: '', address: '', city: '', country: '',
  pricePerNight: '', bedrooms: 1, bathrooms: 1, beds: 1, guestsAllowed: 1,
};

const PropertyForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [position, setPosition] = useState(null);

  const loadProperty = () => {
    getPropertyByIdApi(id)
      .then((res) => {
        const p = res.data.data;
        setForm({
          title: p.title, description: p.description || '', address: p.address || '',
          city: p.city, country: p.country, pricePerNight: p.price_per_night,
          bedrooms: p.bedrooms, bathrooms: p.bathrooms, beds: p.beds, guestsAllowed: p.guests_allowed,
        });
        setImages(p.images || []);
        if (p.latitude && p.longitude) {
          setPosition({ lat: parseFloat(p.latitude), lng: parseFloat(p.longitude) });
        }
      })
      .catch(() => dispatch(showNotification({ message: 'Property not found', type: 'error' })))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isEdit) loadProperty();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        latitude: position?.lat ?? null,
        longitude: position?.lng ?? null,
      };
      if (isEdit) {
        await updatePropertyApi(id, payload);
        dispatch(showNotification({ message: 'Property updated', type: 'success' }));
      } else {
        const res = await createPropertyApi(payload);
        dispatch(showNotification({ message: 'Property created — now add some photos', type: 'success' }));
        navigate(`/host/properties/${res.data.data.id}/edit`);
        return;
      }
    } catch (err) {
      dispatch(showNotification({ message: err.response?.data?.message || 'Save failed', type: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  const handleImageDelete = async (imageId) => {
    try {
      await deletePropertyImageApi(id, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      dispatch(showNotification({ message: 'Image removed', type: 'success' }));
    } catch (err) {
      dispatch(showNotification({ message: 'Could not remove image', type: 'error' }));
    }
  };

  if (loading) return <p className="text-center py-20 text-muted font-sans">Loading...</p>;

  return (
    <div className="px-6 py-10 max-w-2xl mx-auto">
      <h1 className="font-display text-3xl font-semibold text-ink mb-6">
        {isEdit ? 'Edit property' : 'List a new property'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white border border-border rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Title</label>
          <input name="title" required value={form.title} onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Description</label>
          <textarea name="description" rows={4} value={form.description} onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Address</label>
          <input name="address" value={form.address} onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">City</label>
            <input name="city" required value={form.city} onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Country</label>
            <input name="country" required value={form.country} onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-start">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Location on map</label>
            <LocationPicker position={position} onSelect={setPosition} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1 opacity-0 select-none">Coordinates</label>
            <LatLngInputs position={position} onSelect={setPosition} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Price per night (₹)</label>
          <input type="number" name="pricePerNight" min="1" required value={form.pricePerNight} onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono" />
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Bedrooms</label>
            <input type="number" name="bedrooms" min="0" value={form.bedrooms} onChange={handleChange}
              className="w-full px-2 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Beds</label>
            <input type="number" name="beds" min="1" value={form.beds} onChange={handleChange}
              className="w-full px-2 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Baths</label>
            <input type="number" name="bathrooms" min="1" value={form.bathrooms} onChange={handleChange}
              className="w-full px-2 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Guests</label>
            <input type="number" name="guestsAllowed" min="1" value={form.guestsAllowed} onChange={handleChange}
              className="w-full px-2 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full py-3 rounded-md bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50">
          {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create property'}
        </button>
      </form>

      {isEdit && (
        <div className="mt-8">
          <h2 className="font-display text-xl text-ink mb-3">Photos</h2>
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {images.map((img) => (
                <div key={img.id} className="relative group">
                  <img src={img.image_url} alt="" className="w-full h-24 object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={() => handleImageDelete(img.id)}
                    className="absolute top-1 right-1 bg-ink/70 text-paper w-6 h-6 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  {Boolean(img.is_cover) && (
                    <span className="absolute bottom-1 left-1 bg-accent text-white text-xs font-mono px-1.5 py-0.5 rounded">
                        Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <ImageUploader propertyId={id} onUploaded={loadProperty} />
        </div>
      )}
    </div>
  );
};

export default PropertyForm;