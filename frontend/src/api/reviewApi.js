import axiosInstance from './axiosInstance';

export const getReviewsApi = (propertyId) => axiosInstance.get(`/reviews/${propertyId}`);