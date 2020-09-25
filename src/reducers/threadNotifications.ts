import { keyBy } from 'lodash';
import { createSlice } from '@reduxjs/toolkit';

import { ThunkActionType, DispatchType } from 'store';
import NotificationService from 'services/Notification';
import { IReadThreadPayload } from 'types';

const threadNotificationSlice = createSlice({
  name: 'threadNotifications',
  initialState: {},
  reducers: {
    getThreadNotitficationSuccess: (state, { payload }) => {
      return { ...state, ...payload };
    },
  },
});

export const {
  getThreadNotitficationSuccess,
} = threadNotificationSlice.actions;

export const threadNotifications = threadNotificationSlice.reducer;

export const fetchThreadNotificationForTeam = (
  team: number
): ThunkActionType => async (dispatch: DispatchType) => {
  if (!team) return;
  const response = await NotificationService.getThreadNotificationForTeam({
    team,
  });
  const data = keyBy(response.data, 'team');
  dispatch(getThreadNotitficationSuccess(data));
};

export const realtimeReadThread = (
  payload: IReadThreadPayload
): ThunkActionType => async (dispatch: DispatchType) => {
  const { team } = payload;
  const data = { [team]: payload };
  dispatch(getThreadNotitficationSuccess(data));
};
