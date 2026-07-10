const { success, error } = require('../../utils/response');
const { registerUser, loginUser, logoutUser } = require('./auth.service');

const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return error(res, 400, 'All fields are required');
    }

    const result = await registerUser({ name, email, password, role, phone });
    return success(res, 201, 'Registration successful', result);
  } catch (err) {
    return error(res, 400, err.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, 400, 'Email and password required');
    }

    const result = await loginUser({ email, password });
    return success(res, 200, 'Login successful', result);
  } catch (err) {
    return error(res, 401, err.message);
  }
};

const logout = async (req, res) => {
  try {
    await logoutUser(req.token);
    return success(res, 200, 'Logged out successfully');
  } catch (err) {
    return error(res, 400, err.message);
  }
};

module.exports = { register, login, logout };
