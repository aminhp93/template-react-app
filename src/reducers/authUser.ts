import { createSlice } from '@reduxjs/toolkit';

import { ThunkActionType, DispatchType } from 'store';
import ProfileService from 'services/Profile';
import AuthenticationService from 'services/Authentication';


export const slice = createSlice({
  name: 'authUser',
  initialState: null,
  reducers: {
    fetchProfileSuccess: (_, { payload }) => payload,
    updateNotificationPreferencesSuccess: (state, { payload }) => {
      state.preferences = payload
    }
  }
});

export const reducer = slice.reducer;

export const {
  fetchProfileSuccess,
  updateNotificationPreferencesSuccess
} = slice.actions;

export const fetchProfile = (): ThunkActionType => async (dispatch: DispatchType) => {
  const response = await ProfileService.getInfo();
  dispatch(fetchProfileSuccess(response.data));
  return response
};


export type TNotificationPreferences = {
  pushNotificationChoice: string,
  emailNotificationChoice: string
}

export const updateNotificationPreferences = ({
  pushNotificationChoice, emailNotificationChoice
}): ThunkActionType => async (dispatch: DispatchType) => {
  const response = await AuthenticationService.updateSettings({
    push_notification_type: pushNotificationChoice,
    messaging_email_time_window: emailNotificationChoice,
  });

  dispatch(updateNotificationPreferencesSuccess(response.data));
};
