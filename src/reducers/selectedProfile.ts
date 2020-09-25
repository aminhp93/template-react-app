import { createSlice } from '@reduxjs/toolkit';

import { ThunkActionType, DispatchType } from 'store';
import AlumniService from 'services/Alumni';
import { MessagingUserService } from 'services/MessagingUser';

const slice = createSlice({
  name: 'selectedProfile',
  initialState: null,
  reducers: {
    fetchSelectedProfileSuccess: (_, { payload }) => payload,
  }
});

export const selectedProfile = slice.reducer;

export const {
  fetchSelectedProfileSuccess
} = slice.actions;

export const fetchSelectedProfile = (id): ThunkActionType => async (dispatch: DispatchType) => {
  try {
    const response = await AlumniService.getAlumniProfile(id)
    dispatch(fetchSelectedProfileSuccess(response.data));
    return response
  } catch {
    return null
  }
  
};

export const updateProfileSkill = (data): ThunkActionType => async (dispatch: DispatchType, getStoreValue) => {
  try {
    const { authUser } = getStoreValue();

    const id = authUser.id
    const response = await MessagingUserService.updateUserSkill(id, data)
    return response
  } catch {
    return null
  }
  
};