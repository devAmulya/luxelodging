import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedProperty: null,
  checkIn: null,
  checkOut: null,
  numberOfGuests: 1,
  currentBooking: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookingDetails: (state, action) => {
      Object.assign(state, action.payload);
    },
    setCurrentBooking: (state, action) => {
      state.currentBooking = action.payload;
    },
    clearBooking: () => initialState,
  },
});

export const { setBookingDetails, setCurrentBooking, clearBooking } = bookingSlice.actions;
export default bookingSlice.reducer;