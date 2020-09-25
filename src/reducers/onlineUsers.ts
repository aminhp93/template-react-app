import { createSlice } from '@reduxjs/toolkit';


const OnlineUsersSlice = createSlice({
  name: 'onlineUsers',
  initialState: [],
  reducers: {
    getOnlineUsersSuccess: (state, { payload }) => {
      return [...state, ...payload];
    },
    addOnlineUserSuccess: (state, { payload }) => {
        state.push(Number(payload))
    },
    removeOnlineUserSuccess: (state, { payload}) => {
        const index = state.indexOf(Number(payload))
        state.splice(index, 1)
    }
  },
});

export const { 
    getOnlineUsersSuccess,
    addOnlineUserSuccess,
    removeOnlineUserSuccess
} = OnlineUsersSlice.actions;

export const onlineUsers = OnlineUsersSlice.reducer;

