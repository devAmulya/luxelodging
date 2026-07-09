import axiosInstance from './axiosInstance';

export const searchPropertiesApi = (filters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  return axiosInstance.get(`/properties/search?${params.toString()}`);
};

export const getPropertyByIdApi = (id) => axiosInstance.get(`/properties/${id}`);
export const createPropertyApi = (data) => axiosInstance.post('/properties', data);
export const getMyPropertiesApi = () => axiosInstance.get('/properties/host/mine');
export const updatePropertyApi = (id, data) => axiosInstance.put(`/properties/${id}`, data);
export const deletePropertyApi = (id) => axiosInstance.delete(`/properties/${id}`);
export const uploadPropertyImagesApi = (id, formData) =>
  axiosInstance.post(`/properties/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deletePropertyImageApi = (propertyId, imageId) =>
  axiosInstance.delete(`/properties/${propertyId}/images/${imageId}`);