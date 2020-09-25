import { createSlice } from '@reduxjs/toolkit';


const disableAroundAPISlice = createSlice({
  name: 'disableAroundAPI',
  initialState: false,
  reducers: {
    updateDisableAroundAPISuccess: (state, { payload }) => {
      return  payload;
    },
  },
});

export const {
    updateDisableAroundAPISuccess,
} = disableAroundAPISlice.actions;

export const disableAroundAPI = disableAroundAPISlice.reducer;

