import { keyBy } from 'lodash';
import { createSlice } from '@reduxjs/toolkit';

import { ThunkActionType, DispatchType } from 'store';
import NotificationService from 'services/Notification';

const teamNotificationsSlice = createSlice({
  name: 'teamNotifications',
  initialState: {},
  reducers: {
    fetchTeamNotificationsSuccess: (state, { payload }) => {
      return { ...state, ...payload };
    },
  },
});

export const {
  fetchTeamNotificationsSuccess,
} = teamNotificationsSlice.actions;

export const teamNotifications = teamNotificationsSlice.reducer;

export const fetchTeamNotifications = (): ThunkActionType => async (
  dispatch: DispatchType
) => {
  const response = await NotificationService.getTeamsNotifications();
  const data = keyBy(response.data, 'team');
  dispatch(fetchTeamNotificationsSuccess(data));
};
