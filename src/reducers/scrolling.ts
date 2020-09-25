import { createSlice } from '@reduxjs/toolkit';


const scrollingSlice = createSlice({
  name: 'scrolling',
  initialState: false,
  reducers: {
    updateScollingSuccess: (state, { payload }) => {
      return  payload;
    },
  },
});

export const {
    updateScollingSuccess,
} = scrollingSlice.actions;

export const scrolling = scrollingSlice.reducer;

