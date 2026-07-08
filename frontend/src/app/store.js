import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import bookingReducer from '../features/booking/bookingSlice';
import notificationReducer from '../features/notification/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    notification: notificationReducer,
  },
});