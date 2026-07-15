const ai = require('../../config/gemini');
const { getPropertyReviews } = require('../reviews/reviews.service');

const GEN_MODEL = 'gemini-3.1-flash-lite';

const generateDescription = async ({ notes, city, country, bedrooms, guestsAllowed }) => {
  const prompt = `You are a professional copywriter for a short-term rental listings platform.
    Turn the host's rough notes into one polished, inviting property description, 60-120 words.
    Do not invent amenities, features, or details the host didn't mention.
    Write in a warm, natural tone — avoid clichés like "nestled" or "oasis". Plain paragraph, no headers or bullet points.

    Property context: ${bedrooms || 'unspecified'} bedroom(s), sleeps up to ${guestsAllowed || 'unspecified'}, located in ${city || 'an unspecified city'}, ${country || ''}.

    Host's notes:
    """
    ${notes}
    """`;

  const response = await ai.models.generateContent({ model: GEN_MODEL, contents: prompt });
  return response.text.trim();
};

const summarizeReviews = async (reviews) => {
  if (!reviews || reviews.length < 2) return null; // not enough signal to summarize meaningfully

  const reviewText = reviews
    .slice(0, 20) // caps prompt size regardless of how many reviews a property accumulates
    .map((r) => `Rating: ${r.rating}/5 — "${r.comment || 'No comment'}"`)
    .join('\n');

  const prompt = `Summarize what guests are saying about this rental property in 2-3 sentences.
    Be specific and honest — mention both praise and any recurring complaints if present, don't just list positives.
    Do not quote any single review directly. Write in third person, no headers.
    Reviews:
    ${reviewText}`; 

  const response = await ai.models.generateContent({ model: GEN_MODEL, contents: prompt });
  return response.text.trim();
};

module.exports = { generateDescription, summarizeReviews };