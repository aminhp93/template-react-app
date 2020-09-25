import { createSlice } from '@reduxjs/toolkit';


const loadingSlice = createSlice({
  name: 'loading',
  initialState: false,
  reducers: {
    updateLoadingSuccess: (state, { payload }) => {
      return  payload;
    },
  },
});

export const {
    updateLoadingSuccess,
} = loadingSlice.actions;

export const loading = loadingSlice.reducer;

