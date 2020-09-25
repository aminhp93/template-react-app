import { keyBy } from 'lodash';
import { createSlice } from '@reduxjs/toolkit';

import { ThunkActionType, DispatchType } from 'store';
import ReactionService from 'services/Reaction';

const reactionsSlice = createSlice({
  name: 'reactions',
  initialState: null,
  reducers: {
    fetchReactionsSuccess: (state, { payload }) => {
      return { ...state, ...payload };
    },
  },
});

export const {
    fetchReactionsSuccess,
} = reactionsSlice.actions;

export const reactions = reactionsSlice.reducer;

export const fetchReactions = (): ThunkActionType => async (
  dispatch: DispatchType
) => {
  const response = await ReactionService.fetchReactions();
  const data = keyBy(response.data, 'name');
  dispatch(fetchReactionsSuccess(data));
};
