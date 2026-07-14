const { chat } = require('./agent.service');
const { success, error } = require('../../utils/response');

const MAX_MESSAGE_LENGTH = 500;

const sendMessage = async (req, res) => {
  try {
    const { message, interactionId } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return error(res, 400, 'Message is required');
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return error(res, 400, `Message is too long — please keep it under ${MAX_MESSAGE_LENGTH} characters`);
    }

    const result = await chat(interactionId, message.trim());
    return success(res, 200, 'Reply generated', result);
  } catch (err) {
    console.error('Agent error:', err.message);

    const isRateLimit = /429|RESOURCE_EXHAUSTED|rate limit/i.test(err.message || '');
    const status = isRateLimit ? 429 : 500;
    const msg = isRateLimit
      ? 'The assistant is getting a lot of requests right now — please try again shortly.'
      : 'The assistant is temporarily unavailable — please try again.';

    return error(res, status, msg);
  }
};

module.exports = { sendMessage };