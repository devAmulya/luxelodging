const { verifyToken } = require('../utils/jwt');
const { getCache } = require('../utils/cache');
const { error } = require('../utils/response');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Check if token is blacklisted (user logged out)
    const isBlacklisted = await getCache(`blacklist:${token}`);
    if (isBlacklisted) {
      return error(res, 401, 'Token has been invalidated, please login again');
    }

    const decoded = verifyToken(token);
    req.user = decoded; // { id, role }
    req.token = token;
    next();
  } catch (err) {
    return error(res, 401, 'Invalid or expired token');
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return error(res, 403, 'You do not have permission to perform this action');
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };