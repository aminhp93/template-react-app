import { createSlice } from '@reduxjs/toolkit';

import { ThunkActionType, DispatchType } from 'store';
import NotificationService from 'services/Notification';

const userNotificationSlice = createSlice({
  name: 'userNotifications',
  initialState: {},
  reducers: {
    getUserNotitficationSuccess: (state, { payload }) => {
      return { ...state, ...payload };
    },
  },
});

export const {
  getUserNotitficationSuccess,
} = userNotificationSlice.actions;

export const userNotifications = userNotificationSlice.reducer;

export const fetchUserNotification = (): ThunkActionType => async (
    dispatch: DispatchType,
    getStoreValue
) => {
    const { authUser } = getStoreValue();
    if (!authUser) return
    const response = await NotificationService.getUserNotification(authUser.id);
    dispatch(getUserNotitficationSuccess(response.data));
};
