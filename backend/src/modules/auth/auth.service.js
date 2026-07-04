const bcrypt = require('bcrypt');
const { createUser, findUserByEmail } = require('../../models/mysql/user.model');
const { generateToken } = require('../../utils/jwt');
const { setCache } = require('../../utils/cache');
const { verifyToken } = require('../../utils/jwt');

const registerUser = async ({ name, email, password, role, phone }) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = await createUser({ name, email, hashedPassword, role, phone });
  const token = generateToken(userId, role);

  return { token, user: { id: userId, name, email, role, phone: phone || null } };
};

const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user.id, user.role);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profile_image: user.profile_image,
      is_verified: user.is_verified
    }
  };
};

const logoutUser = async (token) => {
  const decoded = verifyToken(token);
  const expiryInSeconds = decoded.exp - Math.floor(Date.now() / 1000);
  
  if (expiryInSeconds > 0) {
    await setCache(`blacklist:${token}`, 'true', expiryInSeconds);
  }
};

module.exports = { registerUser, loginUser, logoutUser };