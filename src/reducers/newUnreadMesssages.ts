import { createSlice } from '@reduxjs/toolkit';

export const NewUnreadMessagesSlice = createSlice({
  name: 'newUnreadMesssages',
  initialState: 0,
  reducers: {
    updateNewUnreadMessagesSuccess: (state, _) => {
      return state + 1;
    },
    resetNewUnreadMessagesuccess: () => {
      return 0;
    },
  },
});

export const {
  updateNewUnreadMessagesSuccess,
  resetNewUnreadMessagesuccess,
} = NewUnreadMessagesSlice.actions;

export const newUnreadMesssages = NewUnreadMessagesSlice.reducer;

