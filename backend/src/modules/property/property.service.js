const {
  createProperty,
  findPropertyById,
  findPropertiesByHost,
  updateProperty,
  deleteProperty
} = require('../../models/mysql/property.model');

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
  return property;
};

const getMyProperties = async (hostId) => {
  return await findPropertiesByHost(hostId);
};

const editProperty = async (id, hostId, fields) => {
  const affectedRows = await updateProperty(id, hostId, fields);
  if (!affectedRows) {
    throw new Error('Property not found or you do not have permission to edit it');
  }
  return { message: 'Property updated successfully' };
};

const removeProperty = async (id, hostId) => {
  const affectedRows = await deleteProperty(id, hostId);
  if (!affectedRows) {
    throw new Error('Property not found or you do not have permission to delete it');
  }
  return { message: 'Property deleted successfully' };
};

module.exports = { addProperty, getProperty, getMyProperties, editProperty, removeProperty };