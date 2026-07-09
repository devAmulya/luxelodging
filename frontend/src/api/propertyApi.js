import axiosInstance from './axiosInstance';

export const searchPropertiesApi = (filters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  return axiosInstance.get(`/properties/search?${params.toString()}`);
};

export const getPropertyByIdApi = (id) => axiosInstance.get(`/properties/${id}`);