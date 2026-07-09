const { pool } = require('../../config/mysql');

const addPropertyImages = async (propertyId, imageUrls) => {
  // Check if this property already has a cover image
  const [existing] = await pool.query(
    'SELECT COUNT(*) as coverCount FROM property_images WHERE property_id = ? AND is_cover = TRUE',
    [propertyId]
  );
  const hasCover = existing[0].coverCount > 0;

  // Continue display_order from wherever the last upload left off
  const [orderRows] = await pool.query(
    'SELECT COALESCE(MAX(display_order), -1) as maxOrder FROM property_images WHERE property_id = ?',
    [propertyId]
  );
  const startOrder = orderRows[0].maxOrder + 1;

  const values = imageUrls.map((url, index) => [
    propertyId,
    url,
    !hasCover && index === 0, // only ever set a cover if one doesn't already exist
    startOrder + index
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

const promoteNewCoverIfNeeded = async (propertyId) => {
  const [existing] = await pool.query(
    'SELECT COUNT(*) as coverCount FROM property_images WHERE property_id = ? AND is_cover = TRUE',
    [propertyId]
  );
  if (existing[0].coverCount > 0) return; // already has a cover, nothing to do

  const [candidates] = await pool.query(
    'SELECT id FROM property_images WHERE property_id = ? ORDER BY display_order ASC LIMIT 1',
    [propertyId]
  );
  if (candidates.length > 0) {
    await pool.query('UPDATE property_images SET is_cover = TRUE WHERE id = ?', [candidates[0].id]);
  }
};

module.exports = { addPropertyImages, getPropertyImages, deletePropertyImage, promoteNewCoverIfNeeded };