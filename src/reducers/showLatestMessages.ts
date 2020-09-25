import { createSlice } from '@reduxjs/toolkit';


const showLatestMessagesSlice = createSlice({
  name: 'showLatestMessages',
  initialState: [],
  reducers: {
    addShowLatestMessagesSuccess: (state, { payload }) => {
      state.push(Number(payload))
    },
    removeShowLatestMessagesSuccess: (state, { payload }) => {
      const index = state.indexOf(Number(payload))
      state.splice(index, 1)
    },
    
  },
});

export const {
  addShowLatestMessagesSuccess,
  removeShowLatestMessagesSuccess
} = showLatestMessagesSlice.actions;

export const showLatestMessages = showLatestMessagesSlice.reducer;

