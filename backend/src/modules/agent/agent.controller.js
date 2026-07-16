const { chat } = require('./agent.service');
const { success, error } = require('../../utils/response');
const { generateDescription, summarizeReviews } = require('./genai.service');
const { getPropertyReviews } = require('../reviews/reviews.service');
const { getCache, setCache } = require('../../utils/cache');

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

const MAX_NOTES_LENGTH = 800;

const generateListingDescription = async (req, res) => {
  try {
    const { notes, city, country, bedrooms, guestsAllowed } = req.body;

    if (!notes || typeof notes !== 'string' || !notes.trim()) {
      return error(res, 400, 'Notes are required');
    }
    if (notes.length > MAX_NOTES_LENGTH) {
      return error(res, 400, `Notes are too long — please keep it under ${MAX_NOTES_LENGTH} characters`);
    }

    const description = await generateDescription({
      notes: notes.trim(), city, country, bedrooms, guestsAllowed,
    });
    return success(res, 200, 'Description generated', { description });
  } catch (err) {
    console.error('Description generation error:', err.message);
    return error(res, 500, 'Could not generate a description right now — please try again.');
  }
};

const getReviewSummary = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const cacheKey = `review-summary:${propertyId}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      return success(res, 200, 'Summary fetched', { summary: cached });
    }

    const { reviews } = await getPropertyReviews(propertyId);
    const summary = await summarizeReviews(reviews);

    if (summary) {
      await setCache(cacheKey, summary, 3600); // 1 hour — reviews don't change often enough to justify shorter
    }

    return success(res, 200, 'Summary fetched', { summary });
  } catch (err) {
    console.error('Review summary error:', err.message);
    return success(res, 200, 'No summary available', { summary: null });
  }
};

module.exports = { sendMessage, generateListingDescription, getReviewSummary };