const {
  addProperty,
  getProperty,
  getMyProperties,
  editProperty,
  removeProperty
} = require('./property.service');
const { success, error } = require('../../utils/response');

const create = async (req, res) => {
  try {
    const property = await addProperty(req.user.id, req.body);
    return success(res, 201, 'Property created successfully', property);
  } catch (err) {
    return error(res, 400, err.message);
  }
};

const getById = async (req, res) => {
  try {
    const property = await getProperty(req.params.id);
    return success(res, 200, 'Property fetched', property);
  } catch (err) {
    return error(res, 404, err.message);
  }
};

const getMine = async (req, res) => {
  try {
    const properties = await getMyProperties(req.user.id);
    return success(res, 200, 'Your properties fetched', properties);
  } catch (err) {
    return error(res, 400, err.message);
  }
};

const update = async (req, res) => {
  try {
    const result = await editProperty(req.params.id, req.user.id, req.body);
    return success(res, 200, result.message);
  } catch (err) {
    return error(res, 403, err.message);
  }
};

const remove = async (req, res) => {
  try {
    const result = await removeProperty(req.params.id, req.user.id);
    return success(res, 200, result.message);
  } catch (err) {
    return error(res, 403, err.message);
  }
};

module.exports = { create, getById, getMine, update, remove };