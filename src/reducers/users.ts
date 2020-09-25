import { createSlice } from '@reduxjs/toolkit';
import { keyBy } from 'lodash';
import Auth from '@aws-amplify/auth';

import { DispatchType, ThunkActionType, dispatch } from 'store';
import { getUrlParams } from 'utils/common';
import { MessagingUserService } from 'services/MessagingUser';
import { UserService } from 'services/User';
import PushNotificationService from "services/PushNotification";
import { fetchProfileSuccess } from "reducers/authUser";


export type TUserParams = {
  term?: string;
  team?: number;
  notInTeam?: number;
  channel?: number;
  notInChannel?: number;
  ids?: number[];
  limit?: boolean;
};

export const usersSlice = createSlice({
  name: 'users',
  initialState: {},
  reducers: {
    fetchUsersListSuccess: (state, { payload }) => {
      if (!state) {
        return payload;
      }
      return { ...state, ...payload };
    },
    updateUserListSuccess: (state, { payload }) => {
      const data = {};
      data[payload.id] = payload;
      return { ...state, ...data };
    }
  },
});

export const { fetchUsersListSuccess, updateUserListSuccess } = usersSlice.actions;

export const users = usersSlice.reducer;

export const fetchUsersList = (
  params: TUserParams = null
): ThunkActionType => async (dispatch: DispatchType) => {
  const { ids, limit } = params;
  if (ids && ids.length === 0 && !limit) return;
  
  const response = await MessagingUserService.searchUser(params);

  // Need to take care of no nested result key when limit is `false`
  const data = keyBy(response.data.results || response.data, 'id');

  dispatch(fetchUsersListSuccess(data));
  return response;
};

export const fetchUserIdsInListListMessage = (
  listMessages?: any,
  users?: any
) => {
  const creatorIds = (listMessages || []).map((item) => item.creator);
  const mentionedIds = (listMessages || []).flatMap((item) => item.mentions);
  const lastMembersIds = (listMessages || []).flatMap(
    (item) => item.lastMembers
  );
  const childrenUserIdsInThread = (listMessages || []).flatMap((item) => {
    return fetchUserIdsInListListMessage(item.listMessages || [], users);
  });
  const reactionIds = (listMessages || []).flatMap((item) => {
    let result = [];
    (item.reactions || []).forEach((i) => {
      result = result.concat(i.users);
    });
    return result;
  });
  const pinUserIds = (listMessages || []).filter(item => item.pinnedUser).map((item) => item.pinnedUser);
  return Array.from(
    new Set(
      creatorIds
        .concat(mentionedIds)
        .concat(lastMembersIds)
        .concat(childrenUserIdsInThread)
        .concat(reactionIds)
        .concat(pinUserIds)
    )
  ).filter((id) => id && !users[id]);
};

export const fetchUsersForListMessage = (
  listMessages?: any
): ThunkActionType => async (dispatch: DispatchType, getStoreValue) => {
  const { users } = getStoreValue();
  const profileIdsToLoad = fetchUserIdsInListListMessage(
    listMessages || [],
    users
  );
  if (profileIdsToLoad.length > 0) {
    dispatch(
      fetchUsersList({
        ids: profileIdsToLoad,
        limit: false,
        allowRemoved: true,
      })
    );
  }
};

export const fetchUsersForTeam = (teamId?: number): ThunkActionType => async (
  dispatch: DispatchType,
  getStoreValue
) => {
  let params: TUserParams = {};
  if (!teamId) {
    const { selectedTeamId } = getStoreValue();
    params = { team: selectedTeamId };
  }
  fetchUsersList(params);
};

export const fetchUsersForChannel = (
  channelId?: number
): ThunkActionType => async (dispatch: DispatchType, getStoreValue) => {
  let params: TUserParams = {};
  if (!channelId) {
    const { selectedConversationId } = getStoreValue();
    params = { channel: selectedConversationId };
  }
  fetchUsersList(params);
};

export const searchUserInTeam = (params): ThunkActionType => async (
  dispatch: DispatchType,
  getStoreValue
) => {
  const { page, term } = params;
  let { team } = params;
  if (!team) {
    const { selectedTeamId } = getStoreValue();
    team = selectedTeamId;
  }
  const requestData = { term, team };
  const requestParams = page ? { page } : null;

  const response = await MessagingUserService.searchUser(
    requestData,
    requestParams
  );
  const { results, next } = response.data;
  const data = keyBy(results, 'id');
  dispatch(fetchUsersListSuccess(data));

  const nextPage = next ? parseInt(getUrlParams(next, 'page'), 10) : null;
  return { users: results, nextPage };
};

interface IUserSearchParams {
  term?: string | null;
  channel?: number | null;
  page?: number | null;
}

export const searchUserInConversation = (
  params: IUserSearchParams
): ThunkActionType => async (dispatch: DispatchType, getStoreValue) => {
  const { page, term } = params;
  let { channel } = params;
  if (!channel) {
    const { selectedConversationId } = getStoreValue();
    channel = selectedConversationId;
  }
  const requestData = { channel, term };
  const requestParams = page ? { page } : null;

  const response = await MessagingUserService.searchUser(
    requestData,
    requestParams
  );
  const { results, next } = response.data;
  const data = keyBy(results, 'id');
  dispatch(fetchUsersListSuccess(data));

  const nextPage = next ? parseInt(getUrlParams(next, 'page'), 10) : null;
  return { users: results, nextPage };
};

interface INotInChannelParams {
  term?: string | null;
  page?: number | null;
  team?: number | null;
  notInChannel: number | null;
}

/**
 * Search for users of a team that are not currently in a channel
 *
 * TODO: Merge this function with the one above to create a common search user
 */
export const searchUserNotInConversation = (
  params: INotInChannelParams
): ThunkActionType => async (dispatch: DispatchType, getStoreValue) => {
  const { page, team, notInChannel, term } = params;
  const requestData = { team, notInChannel, term };
  const requestParams = page ? { page } : null;

  const response = await MessagingUserService.searchUser(
    requestData,
    requestParams
  );
  const data = keyBy(response.data.results, 'id');

  dispatch(fetchUsersListSuccess(data));

  const { next } = response.data;
  const nextPage = next ? parseInt(getUrlParams(next, 'page'), 10) : null;

  return { users: data, nextPage };
};

export const realtimeGlobalSignOut = () => async () => {
  try {
    await PushNotificationService.deactivateToken();
  } finally {
    await Auth.signOut();
    window.location.reload();
  }
};

export const updateUserStatus = data => async (dispatch) => {
  const res = await MessagingUserService.updateUserStatus(data);
  dispatch(updateUserListSuccess(res.data))

}

export const fetchSkillList = data => async (_, getStoreValue) => {
  const { authUser } = getStoreValue();
  const dataRequest = {
    ...data,
    userId: authUser.id
  }
  const res = await UserService.searchSkill(dataRequest);
  return res.data
}

export const getUserSkills = (id) => async (_, getStoreValue) => {
  const { authUser } = getStoreValue();
  const res = await UserService.getUserSkills(id || authUser.id);
  return res
}

export const updateSkillConfirm = () => async (_, getStoreValue) => {
  const res = await UserService.updateSkillConfirm();
  dispatch(fetchProfileSuccess(res.data))
  return res
}