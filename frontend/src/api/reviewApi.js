import axiosInstance from './axiosInstance';

export const createReviewApi = (data) => axiosInstance.post('/reviews', data);
export const getReviewsApi = (propertyId) => axiosInstance.get(`/reviews/${propertyId}`);
export const deleteReviewApi = (reviewId) => axiosInstance.delete(`/reviews/${reviewId}`);