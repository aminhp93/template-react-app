import { createSlice } from '@reduxjs/toolkit';
import { ThunkActionType } from 'store';
import ThreadService from 'services/Thread';
import { keyBy } from 'lodash';

import {
  fetchMessageListFromThreadSuccess,
  updateMessageSuccess,
} from 'reducers/messages';
import { SecondaryView } from 'types';
import { fetchUsersForListMessage } from "reducers/users";


export const NewThreadsSlice = createSlice({
  name: 'newThreads',
  initialState: 0,
  reducers: {
    updateNewThreadsSuccess: (state, _) => {
      return state + 1;
    },
    resetNewThreadSuccess: () => {
      return 0;
    },
  },
});

export const {
  updateNewThreadsSuccess,
  resetNewThreadSuccess,
} = NewThreadsSlice.actions;

export const newThreads = NewThreadsSlice.reducer;

export const fetchThreadList = (url?: string): ThunkActionType => async (
  dispatch,
  getStoreValue
) => {
  const team = getStoreValue().selectedTeamId;
  const response = await ThreadService.fetchThreadList({ team }, url);
  const data = keyBy(response.data.results, 'id');
  dispatch(fetchUsersForListMessage(response.data.results));
  dispatch(fetchMessageListFromThreadSuccess(data));
  dispatch(
    fetchThreadListSuccess(response.data.results.map((item) => item.id))
  );
  return response;
};

export const getThreadDetail = (messageId: number): ThunkActionType => async (
  dispatch,
) => {
  const response = await ThreadService.getThreadDetail(messageId);
  const data = {};
  data[response.data.id] = response.data;
  dispatch(fetchUsersForListMessage([response.data]));
  dispatch(fetchMessageListFromThreadSuccess(data));
};

export const markReadThread = (messageId: number): ThunkActionType => async (
  dispatch,
) => {
  const response = await ThreadService.getMarkReadThread(messageId);
  dispatch(updateMessageSuccess(response.data));
};

export const realtimeCreateThread = (data: any): ThunkActionType => async (
  dispatch,
  getStoreValue
) => {
  const { selectedTeamId, secondaryView } = getStoreValue();
  const { team, threadId } = data;
  if (secondaryView === SecondaryView.THREAD_LIST) {
    if (selectedTeamId === team || !team) {
      dispatch(updateNewThreadsSuccess(data))
    }
  }
};

export const ThreadsSlice = createSlice({
  name: 'threads',
  initialState: [],
  reducers: {
    fetchThreadListSuccess: (state, { payload }) => {
      return [...state, ...payload];
    },
    emptyThreadListSuccess: () => {
      return [];
    },
  },
});

export const {
  fetchThreadListSuccess,
  emptyThreadListSuccess,
} = ThreadsSlice.actions;

export const threads = ThreadsSlice.reducer;
