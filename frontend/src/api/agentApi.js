import axiosInstance from './axiosInstance';

export const generateDescriptionApi = (data) => axiosInstance.post('/agent/generate-description', data);
export const getReviewSummaryApi = (propertyId) => axiosInstance.get(`/agent/review-summary/${propertyId}`);
export const sendMessageApi = (message, interactionId) => axiosInstance.post('/agent/chat', { message, interactionId });