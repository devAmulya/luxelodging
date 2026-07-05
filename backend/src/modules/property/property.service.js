const {
  createProperty,
  findPropertyById,
  findPropertiesByHost,
  updateProperty,
  deleteProperty,
  searchProperties
} = require('../../models/mysql/property.model');
const { getCache, setCache } = require('../../utils/cache');
const { deleteCacheByPattern } = require('../../utils/cache');
const fs = require('fs');
const cloudinary = require('../../config/cloudinary');
const { addPropertyImages, getPropertyImages, deletePropertyImage } = require('../../models/mysql/propertyImage.model');

const addProperty = async (hostId, data) => {
  const {
    title, description, address, city, country,
    latitude, longitude, pricePerNight, bedrooms, bathrooms, beds, guestsAllowed
  } = data;

  if (!title || !city || !country || !pricePerNight) {
    throw new Error('Title, city, country, and price are required');
  }

  if (pricePerNight <= 0) {
    throw new Error('Price must be greater than 0');
  }

  const propertyId = await createProperty({
    hostId, title, description, address, city, country,
    latitude, longitude, pricePerNight, bedrooms, bathrooms, beds, guestsAllowed
  });

  return { id: propertyId, title, city, country, pricePerNight };
};

const getProperty = async (id) => {
  const property = await findPropertyById(id);
  if (!property) {
    throw new Error('Property not found');
  }
  const images = await getPropertyImages(id);
  return { ...property, images };
};

const getMyProperties = async (hostId) => {
  return await findPropertiesByHost(hostId);
};

const editProperty = async (id, hostId, fields) => {
  const affectedRows = await updateProperty(id, hostId, fields);
  if (!affectedRows) {
    throw new Error('Property not found or you do not have permission to edit it');
  }
  await deleteCacheByPattern('search:*'); // invalidate all cached searches
  return { message: 'Property updated successfully' };
};

const removeProperty = async (id, hostId) => {
  const affectedRows = await deleteProperty(id, hostId);
  if (!affectedRows) {
    throw new Error('Property not found or you do not have permission to delete it');
  }
  return { message: 'Property deleted successfully' };
};

const uploadPropertyImages = async (propertyId, hostId, files) => {
  const property = await findPropertyById(propertyId);
  if (!property || property.host_id !== hostId) {
    // cleanup temp files before throwing
    files.forEach(file => fs.unlinkSync(file.path));
    throw new Error('Property not found or you do not have permission');
  }

  const uploadedUrls = [];

  for (const file of files) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'luxelodging/properties'
    });
    uploadedUrls.push(result.secure_url);
    fs.unlinkSync(file.path); // delete temp local file after upload
  }

  await addPropertyImages(propertyId, uploadedUrls);
  return uploadedUrls;
};

const removePropertyImage = async (propertyId, imageId, hostId) => {
  const property = await findPropertyById(propertyId);
  if (!property || property.host_id !== hostId) {
    throw new Error('Property not found or you do not have permission');
  }

  const affectedRows = await deletePropertyImage(imageId, propertyId);
  if (!affectedRows) {
    throw new Error('Image not found');
  }

  return { message: 'Image deleted successfully' };
};

const searchAllProperties = async (filters) => {
  // Build a consistent cache key from filters
  const cacheKey = `search:${JSON.stringify(filters)}`;

  const cached = await getCache(cacheKey);
  if (cached) {
    return { source: 'cache', results: cached };
  }

  const results = await searchProperties(filters);
  await setCache(cacheKey, results, 600); // cache for 10 minutes

  return { source: 'database', results };
};

module.exports = {
  addProperty, getProperty, getMyProperties, editProperty, removeProperty,
  uploadPropertyImages, removePropertyImage, searchAllProperties
};