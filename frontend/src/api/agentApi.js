import axiosInstance from './axiosInstance';

export const sendMessageApi = (message, interactionId) => axiosInstance.post('/agent/chat', { message, interactionId });