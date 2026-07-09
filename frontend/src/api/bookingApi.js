import axiosInstance from './axiosInstance';

export const getCalendarApi = (propertyId) =>
  axiosInstance.get(`/bookings/calendar/${propertyId}`);

export const checkAvailabilityApi = (propertyId, checkIn, checkOut) =>
  axiosInstance.get(`/bookings/availability/${propertyId}?checkIn=${checkIn}&checkOut=${checkOut}`);

