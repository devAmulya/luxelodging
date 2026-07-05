const { pool } = require('../../config/mysql');

const addPropertyImages = async (propertyId, imageUrls) => {
  const values = imageUrls.map((url, index) => [
    propertyId,
    url,
    index === 0, // first image = cover
    index
  ]);

  const [result] = await pool.query(
    'INSERT INTO property_images (property_id, image_url, is_cover, display_order) VALUES ?',
    [values]
  );
  return result.affectedRows;
};

const getPropertyImages = async (propertyId) => {
  const [rows] = await pool.query(
    'SELECT id, image_url, is_cover, display_order FROM property_images WHERE property_id = ? ORDER BY display_order ASC',
    [propertyId]
  );
  return rows;
};

const deletePropertyImage = async (imageId, propertyId) => {
  const [result] = await pool.query(
    'DELETE FROM property_images WHERE id = ? AND property_id = ?',
    [imageId, propertyId]
  );
  return result.affectedRows;
};

module.exports = { addPropertyImages, getPropertyImages, deletePropertyImage };