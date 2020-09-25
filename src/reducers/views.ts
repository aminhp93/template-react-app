import { createSlice } from '@reduxjs/toolkit';
import { ThunkActionType, DispatchType } from 'store';

import { PrimaryView, TPrimaryView, SecondaryView } from 'types';
import { getThreadDetail, emptyThreadListSuccess, resetNewThreadSuccess } from 'reducers/threads';

export const PrimaryViewSlice = createSlice({
  name: 'primaryView',
  initialState: PrimaryView.ConversationPlaceholder,
  reducers: {
    updatePrimaryViewSuccess: (state, { payload }) => payload,
  },
});

export const primaryView = PrimaryViewSlice.reducer;
export const { updatePrimaryViewSuccess } = PrimaryViewSlice.actions;

export const updatePrimaryView = (
  viewType: TPrimaryView
): ThunkActionType => async (dispatch: DispatchType) => {
  dispatch(updatePrimaryViewSuccess(viewType));
};

export const SecondaryViewSlice = createSlice({
  name: 'secondaryView',
  initialState: null,
  reducers: {
    updateSecondaryViewSuccess: (state, { payload }) => payload,
  },
});

export const secondaryView = SecondaryViewSlice.reducer;
export const { updateSecondaryViewSuccess } = SecondaryViewSlice.actions;

export const updateSecondaryView = (
  viewType: SecondaryView,
  messageId?: number
): ThunkActionType => async (dispatch: DispatchType) => {
  if (viewType === SecondaryView.THREAD_LIST) {
    dispatch(updateSecondaryViewSuccess(viewType));
    dispatch(updateSelectedThreadDetailSuccess(null));
  } else if (viewType === SecondaryView.THREAD_DETAIL) {
    if (messageId) {
      await dispatch(getThreadDetail(messageId));
      dispatch(updateSelectedThreadDetailSuccess(messageId));
    }
    dispatch(updateSecondaryViewSuccess(viewType));
    dispatch(emptyThreadListSuccess());
    dispatch(resetNewThreadSuccess());
  } else if (viewType === SecondaryView.SAVED_MESSAGE_LIST) {
    dispatch(updateSecondaryViewSuccess(viewType));
  } else if (viewType === SecondaryView.CONVERSATION_INFO) {
    dispatch(updateSecondaryViewSuccess(viewType));
    dispatch(updateSelectedThreadDetailSuccess(null));
    dispatch(emptyThreadListSuccess());
    dispatch(resetNewThreadSuccess());
  } else {
    dispatch(updateSecondaryViewSuccess(null));
    dispatch(updateSelectedThreadDetailSuccess(null));
    dispatch(emptyThreadListSuccess());
    dispatch(resetNewThreadSuccess());
  } 
};

export const emptySecondaryView = (data: any): ThunkActionType => async (
  dispatch: DispatchType,
  getStoreValue
) => {
  const { selectedConversationId } = getStoreValue();
  if (data.channel === selectedConversationId) {
    dispatch(updateSecondaryViewSuccess(null));
  }
};

export const SelectedThreadDetailSlice = createSlice({
  name: 'selectedThreadDetail',
  initialState: null,
  reducers: {
    updateSelectedThreadDetailSuccess: (state, { payload }) => payload,
  },
});

export const {
  updateSelectedThreadDetailSuccess,
} = SelectedThreadDetailSlice.actions;
export const selectedThreadDetail = SelectedThreadDetailSlice.reducer;
