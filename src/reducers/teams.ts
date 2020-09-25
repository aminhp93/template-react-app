import { createSlice } from '@reduxjs/toolkit';
import { uniq, keyBy, cloneDeep, orderBy, partition } from 'lodash';

import { ThunkActionType, DispatchType } from 'store';
import TeamService from 'services/Team';
import { updateSecondaryView } from 'reducers/views';

import {
  selectConversation,
  fetchChannelWithNotifications,
  getPublicChannelBySlug
} from './conversations';
import { fetchTeamNotifications } from './teamNotifications';
import {
  PrimaryView,
  IReadTeamPayload,
  ITeamMembership,
  TTeam,
  TConversation,
} from 'types';
import { fetchUsersList } from './users';
import { updatePrimaryView } from './views';
import { fetchThreadNotificationForTeam } from './threadNotifications';
import {getDefaultChannel} from "components/messaging/utils";


export type TTeamPayload = {
  id: number;
  name: string;
  displayName: string;
  description: string;
  email: string;
  teamType: string;
  creator: number;
  image: string;
  admins: number[];
  participants: number[];
  mmId: string;
};

export const teamsSlice = createSlice({
  name: 'teams',
  initialState: {},
  reducers: {
    /**
     * Needed a separate action here since `fetchTeamListSuccess`
     * merges the payload with existing state
     */
    replaceTeamList: (_, { payload }) => {
      return payload;
    },

    /**
     * Update the team list, doing it here so we won't have to
     * do the cloning manually
     */
    updateTeamListOrder: (state, { payload }) => {
      (payload as TTeam[]).forEach((team, index) => {
        state[team.id].order = index;
      });
    },

    fetchTeamListSuccess: (state, { payload }) => {
      return { ...state, ...payload };
    },
    createTeamSuccess: (state, { payload }) => {
      state[payload.id] = { ...state[payload.id], ...payload };
    },
    updateTeamSuccess: (state, { payload }) => {
      state[payload.id] = payload;
    },
    joinTeamSuccess: (state, { payload }) => {
      state[payload.id] = payload;
    },
    leaveTeamSuccess: (state, { payload }) => {
      delete state[payload];
    },
    addTeamMemberSuccess: (state, { payload }) => {
      const team = state[payload.team];
      if (team) {
        if (payload.isAdmin) {
          team.admins.push(payload.userId);
          team.admins = uniq(team.admins);
        }

        team.members.push(payload.userId);
        team.members = uniq(team.members);

        state[payload.team] = team;
      }
    },
    removeTeamMemberSuccess: (state, { payload }) => {
      const target = state[payload.team];
      if (target) {
        const admins = target.admins.filter((id) => id !== payload.userId);
        const members = target.members.filter((id) => id !== payload.userId);

        target.admins = admins;
        target.members = members;

        state[payload.team] = target;
      }
    },
    removeTeamAdminSuccess: (state, { payload }) => {
      const target = state[payload.team];
      if (target) {
        const admins = target.admins.filter((id) => id !== payload.userId);
        target.admins = admins;
        state[payload.team] = target;
      }
    },
    assignTeamAdminSuccess: (state, { payload }) => {
      const target = state[payload.team];
      if (target) {
        target.admins.push(payload.userId);
        target.admins = uniq(target.admins);
        state[payload.team] = target;
      }
    },
  },
});

export const {
  replaceTeamList,
  updateTeamListOrder,
  fetchTeamListSuccess,
  createTeamSuccess,
  updateTeamSuccess,
  joinTeamSuccess,
  leaveTeamSuccess,
  addTeamMemberSuccess,
  removeTeamMemberSuccess,
  removeTeamAdminSuccess,
  assignTeamAdminSuccess,
} = teamsSlice.actions;

export const createTeam = (
  data: TTeamPayload = null
): ThunkActionType => async (dispatch) => {
  const dataRequest = {
    ...data,
  };
  const response = await TeamService.createTeam(dataRequest);
  if (response.data && response.data.id) {
    dispatch(createTeamSuccess(response.data));
    dispatch(selectTeam(response.data.id));
  }
};

export const updateTeam = (data: any = null): ThunkActionType => async (
  _dispatch,
  getStoreValue
) => {
  const { selectedTeamId } = getStoreValue();
  await TeamService.updateTeam(selectedTeamId, data);
};

export const teams = teamsSlice.reducer;

export const selectedTeamIdSlice = createSlice({
  name: 'selectedTeamId',
  initialState: null,
  reducers: {
    selectTeamSuccess: (_, { payload }) => payload,
  },
});

export const { selectTeamSuccess } = selectedTeamIdSlice.actions;

export const selectTeam = (
  id: number,
  channel?: string,
  threadId?: number
): ThunkActionType => async (dispatch, getStoreValue) => {
  const { selectedTeamId: oldSelectedTeam } = getStoreValue();
  let selectedConvId;
  if (!oldSelectedTeam || oldSelectedTeam !== id) {
    dispatch(updatePrimaryView(PrimaryView.ConversationPlaceholder));
    dispatch(updateSecondaryView(null));
    await dispatch(selectTeamSuccess(id));
    await dispatch(fetchChannelWithNotifications({ team: id }));
    // Select the default channel when switch team
    if (channel) {
      const { conversations } = getStoreValue();
      // Go to from router
      const channels = Object.values(conversations).filter(
        (item: TConversation) => !item.team || item.team === id
      );
      const conversation: any = channels.find(
        (item: TConversation) => item.slug && item.slug === channel
      );
      if (conversation) {
        selectedConvId = conversation.id
      } else {
        // Check if the user has already select another channels
        // Fetch public channel to preview channel from url
        try {
          const res: any = await dispatch(getPublicChannelBySlug(String(channel)))
          if (res.data && res.data.id) {
            selectedConvId = res.data.id
          }
        } catch {
          selectedConvId = getDefaultChannel(getStoreValue());
        }
      }
    } else {
      selectedConvId = getDefaultChannel(getStoreValue());
    }
  }

  dispatch(selectConversation(selectedConvId, null, threadId));
  dispatch(fetchUsersList({ team: id }));
  dispatch(fetchThreadNotificationForTeam(id));
};

export const selectTeamDmg = (
  id: number
): ThunkActionType => async (dispatch, getStoreValue) => {
  const { selectedTeamId: oldSelectedTeam } = getStoreValue();

  if (!oldSelectedTeam || oldSelectedTeam !== id) {
    dispatch(selectTeamSuccess(id));
    await dispatch(fetchChannelWithNotifications({ team: id }));
  }
  dispatch(fetchUsersList({ team: id }));
  dispatch(fetchThreadNotificationForTeam(id));
};

export const selectedTeamId = selectedTeamIdSlice.reducer;

/**
 * Retrieve the list of teams for current user
 */
export const fetchTeamList = (): ThunkActionType => async (dispatch) => {
  const response = await TeamService.fetchTeams();
  const data = keyBy(response.data, 'id');
  dispatch(fetchTeamListSuccess(data));
  return response;
};

/**
 * Fetch a team by its id
 */
export const fetchTeamById = (teamId: number): ThunkActionType => async (
  dispatch: DispatchType
) => {
  const response = await TeamService.fetchTeamById(teamId);
  const data = keyBy([response.data], 'id');
  dispatch(fetchTeamListSuccess(data));
  return response.data;
};

/**
 * Leave the current team
 */
export const leaveTeam = (teamId: number): ThunkActionType => async () => {
  await TeamService.leaveTeam(teamId);
};

/**
 * Handle realtime leave team
 */
export const realtimeLeaveTeam = (payload: any): ThunkActionType => async (
  dispatch,
  getStoreValue
) => {
  const { teams, selectedTeamId, authUser } = getStoreValue();
  const { team, userId } = payload;
  if (team === selectedTeamId && userId === authUser.id) {
    const nextSelectedTeamId = Object.keys(teams).filter(
      (id) => id !== JSON.stringify(selectedTeamId)
    )[0];
    dispatch(selectTeam(Number.parseInt(nextSelectedTeamId, 10)));
    dispatch(leaveTeamSuccess(team));
  } else {
    // Remove member, admin in team
    const selectedTeam = cloneDeep(teams[team]);
    const { members, admins } = selectedTeam;

    const indexMember = members.indexOf(userId);
    indexMember > -1 && members.splice(indexMember, 1);
    const indexAdmin = admins.indexOf(userId);
    indexAdmin > -1 && admins.splice(indexAdmin, 1);

    selectedTeam.members = members;
    selectedTeam.admins = admins;

    dispatch(updateTeamSuccess(selectedTeam));
  }
};

export const addTeamMember = (
  teamId: number,
  members: number[]
): ThunkActionType => async (dispatch: DispatchType, getStoreValue) => {
  const { selectedTeamId, users } = getStoreValue();

  let id = teamId;
  if (!id) {
    id = selectedTeamId;
  }
  const requestData = members.map((userId) => ({ userId }));
  const response = await TeamService.addTeamMember(id, requestData);

  const userIdsToFetch = response.data
    .map((d) => d.userId)
    .filter((id) => !users[id]);
  if (userIdsToFetch.length > 0) {
    dispatch(fetchUsersList({ ids: userIdsToFetch, limit: false }));
  }

  return response;
};

/**
 * Remove a member from a team
 */
export const removeTeamMember = (
  teamId: number,
  userId: number
): ThunkActionType => async (dispatch: DispatchType) => {
  await TeamService.removeTeamMember(teamId, userId);
  dispatch(removeTeamMemberSuccess({ teamId, userId }));
};

/**
 * Assign a user as the admin of a team
 */
export const makeTeamAdmin = (
  teamId: number,
  userId: number
): ThunkActionType => async (dispatch: DispatchType) => {
  await TeamService.updateMembership(teamId, userId, { isAdmin: true });
  dispatch(assignTeamAdminSuccess({ teamId, userId }));
};

export const removeTeamAdmin = (
  teamId: number,
  userId: number
): ThunkActionType => async (dispatch: DispatchType) => {
  await TeamService.updateMembership(teamId, userId, { isAdmin: false });
  dispatch(removeTeamAdminSuccess({ teamId, userId }));
};

/**
 * Handler for the `JOIN_TEAM` event
 */
export const realtimeJoinTeam = (payload: any): ThunkActionType => async (
  dispatch: DispatchType,
  getStoreValue
) => {
  const { teams } = getStoreValue();
  const teamIds = uniq(
      (payload || []).flatMap((m) => m.team).filter((id) => !teams[id])
  );
  await Promise.all(
    teamIds.map(async (teamId) => {
      await dispatch(fetchTeamById(teamId));
    })
  );

  // Add member to member list of added team
  payload.map((i) => {
    const { userId, team } = i;
    const selectedTeam = cloneDeep(teams[team]);
    if (selectedTeam) {
      const { members } = selectedTeam;
      const indexMember = members.indexOf(userId);
      indexMember === -1 && members.unshift(userId);
      selectedTeam.members = members;
      dispatch(updateTeamSuccess(selectedTeam));
    }
  });
};

export const realtimeReadTeam = (
  payload: IReadTeamPayload
): ThunkActionType => async (dispatch: DispatchType) => {
  dispatch(fetchTeamNotifications());
};

export const realtimeAssignTeamAdmin = (
  payload: ITeamMembership
): ThunkActionType => async (dispatch: DispatchType) => {
  const { isAdmin } = payload;
  if (isAdmin) {
    dispatch(assignTeamAdminSuccess(payload));
  } else {
    dispatch(removeTeamAdminSuccess(payload));
  }
};

export const reorder = (id: number, index: number) => async (
  dispatch,
  getStoreValue
) => {
  const teams = getStoreValue().teams as TTeam[];
  const [reordered, others] = partition(
    Object.values(teams),
    (team) => team.id === id
  );

  if (!reordered.length) return;

  const items = orderBy(others, ['order', 'created'], ['asc', 'desc']);
  items.splice(index, 0, reordered[0]);
  dispatch(updateTeamListOrder(items));

  await TeamService.reorder(
    items.map((team, order) => ({ team: team.id, order }))
  );
};
