import { createSlice } from '@reduxjs/toolkit';
import { ThunkActionType, DispatchType } from 'store';
import { get, forEach, uniq, keyBy } from 'lodash';

import { ConversationType, IReadChannelPayload, PrimaryView, SecondaryView, TConversationType } from 'types';
import { fetchUsersList } from 'reducers/users';
import {
  updatePrimaryView,
  updateSecondaryView,
  emptySecondaryView,
} from 'reducers/views';
import { deleteAllMessageInChannel } from 'reducers/messages';
import ConversationService from 'services/Conversation';
import NotificationService from 'services/Notification';
import { getDefaultChannel } from 'components/messaging/utils';
import { resetNewUnreadMessagesuccess } from 'reducers/newUnreadMesssages';

export const conversationSlice = createSlice({
  name: 'conversations',
  initialState: {},
  reducers: {
    fetchConversationListSuccess: (state, { payload }) => {
      return { ...state, ...payload };
    },
    updateFetchConversationListSuccess: (state, { payload }) => {
      return { ...payload, ...state };
    },
    createConversationSuccess: (state, { payload }) => {
      state[payload.id] = { ...state[payload.id], ...payload };
    },

    deleteConversationSuccess: (state, { payload }) => {
      delete state[payload];
    },

    leaveConversationSuccess: (state, { payload }) => {
      const { channel } = payload;
      const selectedConversation = state[channel];
      const newMembers = selectedConversation.members.filter(
        (i) => i !== payload.userId
      );
      state[channel] = {
        ...state[channel],
        members: newMembers,
      };
    },

    updateConversationSuccess: (state, { payload }) => {
      // logic with isRead && mentionCount
      if (get(payload, 'isRead', undefined) === undefined){
        payload.isRead = get(state[payload.id], 'isRead', true);
      }
      if (get(payload, 'mentionCount', undefined) === undefined){
        payload.mentionCount = get(state[payload.id], 'mentionCount', 0);
      }
      state[payload.id] = { ...state[payload.id], ...payload };
    },

    addChannelMemberSuccess: (state, { payload }) => {
      // Expected payload: Array of conversation memberships
      forEach(payload, (membership) => {
        const { isAdmin, channel: channelId, userId } = membership;
        const conversation = state[channelId];
        if (conversation) {
          if (isAdmin) {
            conversation.admins.push(userId);
            conversation.admins = uniq(conversation.admins);
          }
          conversation.members.unshift(userId);
          conversation.members = uniq(conversation.members);

          state[channelId] = conversation;
        }
      });
    },

    makeChannelAdminSuccess: (state, { payload }) => {
      const { channel: channelId } = payload;
      const conversation = state[channelId];

      if (conversation) {
        conversation.admins.push(payload.userId);
        conversation.admins = uniq(conversation.admins);

        state[channelId] = conversation;
      }
    },

    removeChannelAdminSuccess: (state, { payload }) => {
      const { channel: channelId } = payload;
      const conversation = state[channelId];

      if (conversation) {
        conversation.admins = conversation.admins.filter(
          (id) => id !== payload.userId
        );
        state[channelId] = conversation;
      }
    },

    removeChannelMemberSuccess: (state, { payload }) => {
      const { channel: channelId, userId, isAdmin } = payload;
      const conversation = state[channelId];

      if (conversation) {
        if (isAdmin) {
          conversation.admins = conversation.admins.filter(
            (id) => id !== userId
          );
        }
        conversation.members = conversation.members.filter(
          (id) => id !== userId
        );

        state[channelId] = conversation;
      }
    },

    updateChannelMentionSuccess: (state, { payload }) => {
      const channelId = payload;
      const conversation = state[channelId];

      if (conversation) {
        conversation.mentionCount += 1;
        state[channelId] = conversation;
      }
    },

    updateChannelUnreadSuccess: (state, { payload }) => {
      const channelId = payload;
      const conversation = state[channelId];

      if (conversation) {
        conversation.isRead = false;
        state[channelId] = conversation;
      }
    },

    updateDMGNameSuccess: (state, { payload }) => {
      const { id, conversationName } = payload;
      const conversation = state[id];
      if (!conversation) return;
      conversation.conversationName = conversationName;
      state[id] = conversation;
    },

    getNotificationsSuccess: (state, { payload }) => {
      forEach(payload, (p) => {
        const conversation = state[p.channel];
        if (conversation) {
          conversation.isRead = p.isRead;
          conversation.mentionCount = p.mentionCount;

          state[p.channel] = conversation;
        }
      });
    },
  },
});

export const {
  fetchConversationListSuccess,
  updateFetchConversationListSuccess,
  createConversationSuccess,
  deleteConversationSuccess,
  updateConversationSuccess,
  leaveConversationSuccess,
  addChannelMemberSuccess,
  makeChannelAdminSuccess,
  removeChannelAdminSuccess,
  removeChannelMemberSuccess,
  updateChannelMentionSuccess,
  updateChannelUnreadSuccess,
  updateDMGNameSuccess,
  getNotificationsSuccess,
} = conversationSlice.actions;

export type TConversationParams = {
  team?: number;
  conversationType?: number;
};

type TChannelPayload = {
  conversationName: string;
  conversationType: string;
  purpose: string;
};


/**
 * Fetch list of direct messages and conversations from API
 */
export const fetchDMGList = (
  params: TConversationParams = null
): ThunkActionType => async (dispatch) => {
  const response = await ConversationService.fetchDMGList(params);
  const data = keyBy(response.data, 'id');

  const members = (response.data || []).flatMap((conversation) => conversation.members);
  dispatch(
    fetchUsersList({
      ids: uniq(members),
      limit: false,
    })
  );

  dispatch(fetchConversationListSuccess(data));

  return response;
};

export const getDMGsNotifications = (params?: any): ThunkActionType => async (
  dispatch: DispatchType
) => {
  const response = await NotificationService.getDMGsNotifications(params);
  dispatch(getNotificationsSuccess(response.data));
};

/**
 * This function gets a list of DMGs and waits also to get their notifications
 * and merges these data together before updating the store.
 * This helps prevent glitches in conversation sidebar on many occasion such as
 * reconnection
 */
export const fetchDMGListWithNotification = (): ThunkActionType => async (
  dispatch
) => {
  const [dmgData, dmgNotiData] = await Promise.all([
    ConversationService.fetchDMGList(),
    NotificationService.getDMGsNotifications(),
  ]);

  const dmgs = keyBy(dmgData.data, 'id');
  const dmgNotis = keyBy(dmgNotiData.data, 'channel');

  forEach(dmgs, (dmg) => {
    const { id } = dmg;
    const noti = dmgNotis[id];

    if (noti) {
      dmg.isRead = noti.isRead;
      dmg.mentionCount = noti.mentionCount;
    }
  });

  dispatch(fetchConversationListSuccess(dmgs));

  const members = (dmgData.data || []).flatMap((dmg) => dmg.members);
  dispatch(fetchUsersList({ ids: uniq(members), limit: false }));
};

export const fetchChannelWithNotifications = (
  params?: TConversationParams
): ThunkActionType => async (dispatch: DispatchType) => {
  const [convResponse, notiResponse] = await Promise.all([
    ConversationService.fetchConversationList(params),
    NotificationService.getChannelsNotifications(params),
  ]);
  const conversations = keyBy(convResponse.data, 'id');
  const notifications = keyBy(notiResponse.data, 'channel');

  forEach(conversations, (conversation) => {
    const noti = notifications[conversation.id];
    if (noti) {
      conversation.isRead = noti.isRead;
      conversation.mentionCount = noti.mentionCount;
    }
  });

  dispatch(fetchConversationListSuccess(conversations));
};

export const getChannelsNotifications = (
  params: any
): ThunkActionType => async (dispatch: DispatchType) => {
  const response = await NotificationService.getChannelsNotifications(params);
  dispatch(getNotificationsSuccess(response.data));
};

/**
 * Fetch a channel by its Id
 */
export const fetchChannelById = (channelId: number): ThunkActionType => async (
  dispatch: DispatchType
) => {
  const response = await ConversationService.fetchChannelById(channelId);
  const data = keyBy([response.data], 'id');

  dispatch(fetchConversationListSuccess(data));
  return response.data;
};

// Create channel
export const createChannel = (
  data: TChannelPayload = null
): ThunkActionType => async (dispatch, getStoreValue) => {
  const dataRequest = {
    ...data,
    team: getStoreValue().selectedTeamId,
    creator: getStoreValue().authUser.id,
  };
  const response = await ConversationService.createChannel(dataRequest);
  dispatch(createConversationSuccess(response.data));
  dispatch(selectConversation(response.data.id));
  return response;
};

export const editChannel = (
  data: TChannelPayload = null
): ThunkActionType => async (dispatch, getStoreValue) => {
  const dataRequest = {
    ...data,
  };
  const response = await ConversationService.editChannel(
    getStoreValue().selectedConversationId,
    dataRequest
  );
  dispatch(updateConversationSuccess(response.data));
};

export const updateDMG = (
  data: TChannelPayload = null
): ThunkActionType => async (dispatch, getStoreValue) => {
  const { selectedConversationId } = getStoreValue();
  const response = await ConversationService.updateDMG(
    selectedConversationId,
    data
  );
  dispatch(updateConversationSuccess(response.data));
};

export const updateDMGName = (id: number): ThunkActionType => async (
  dispatch,
  getStoreValue
) => {
  const { conversations, users } = getStoreValue();
  const dmg = conversations[id];
  if (!dmg) return;

  const members: any = Object.values(users).filter((user: any) =>
    dmg.members.includes(user.id)
  );
  if (!members) return;

  let conversationName;
  if (members.length === 1) {
    conversationName = `${members[0].fullName}`;
  } else if (members.length === 2) {
    conversationName = `${members[0].fullName}, ${members[1].fullName}`;
  } else if (members.length === 3) {
    conversationName = `${members[0].fullName}, ${members[1].fullName} and another person`;
  } else {
    const rest = members.length - 2;
    conversationName = `${members[0].fullName}, ${members[1].fullName} and ${rest} other people`;
  }

  dispatch(updateDMGNameSuccess({ id: dmg.id, conversationName }));
};

export const deleteChannel = (): ThunkActionType => async (
  dispatch,
  getStoreValue
) => {
  const { selectedConversationId: id } = getStoreValue();
  await ConversationService.deleteChannel(id);
  // Have to update secondaryView first
  await dispatch(updateSecondaryView(null));
  await dispatch(deleteConversationSuccess(id));
  await dispatch(deleteAllMessageInChannel(id));
  // Remove all message in conversation
  const defaultChannel = getDefaultChannel(getStoreValue());
  await dispatch(selectConversation(defaultChannel));
};

export const leaveChannel = (): ThunkActionType => async (
  dispatch,
  getStoreValue
) => {
  const { selectedConversationId, conversations } = getStoreValue();
  const conversation = conversations[selectedConversationId];

  let response;
  if (
    [ConversationType.Public, ConversationType.Private].includes(
      conversation.conversationType
    )
  ) {
    response = await ConversationService.leaveChannel(selectedConversationId);
  } else if ([ConversationType.Group].includes(conversation.conversationType)) {
    response = await ConversationService.leaveGroup(selectedConversationId);
  } else {
    throw new Error('Can only leave a channel or group');
  }
  if (response && response.data) {
    dispatch(leaveConversationSuccess(response.data));
    const defaultChannel = getDefaultChannel(getStoreValue());
    dispatch(selectConversation(defaultChannel));
    dispatch(updateSecondaryView(null));
  }
};

export const conversations = conversationSlice.reducer;

export const selectedConversationIdSlice = createSlice({
  name: 'selectedConversationId',
  initialState: null,
  reducers: {
    selectConversationSuccess: (_, { payload }) => payload,
  },
});

export const {
  selectConversationSuccess,
} = selectedConversationIdSlice.actions;

export const selectedConversationId = selectedConversationIdSlice.reducer;

export const selectConversation = (
  id: number,
  scrollTop?: number,
  threadId?: number,
): ThunkActionType => async (dispatch, getStoreValue) => {
  // remove old class
  const { conversations, selectedConversationId, authUser } = getStoreValue();


  const unreadLineContainerDOM = document.querySelector('.m-unread-line-container');
  const unreadLineDOM = document.querySelector('.m-message-item.m-unread-line');

  unreadLineContainerDOM && unreadLineContainerDOM.remove();
  unreadLineDOM && unreadLineDOM.classList.remove('m-unread-line');

  dispatch(updateConversationSuccess({ id: selectedConversationId, newMessageId: null }));

  dispatch(resetNewUnreadMessagesuccess());

  if (id) {
    if (scrollTop) {
      // Save the last scroll position of each conversation
      dispatch(
        updateConversationSuccess({ id: selectedConversationId, scrollTop })
      );
    }
  }

  if(!id) return;

  const selectedConversation = conversations[id];
  const isMember = selectedConversation && selectedConversation.members.includes(authUser.id);
  if (!isMember && selectedConversation.conversationType !== ConversationType.Public) return;

  if (scrollTop) {
    // Save the last scroll position of each conversation
    dispatch(
      updateConversationSuccess({ id: selectedConversationId, scrollTop })
    );
  }
  if (id !== selectedConversationId) {
    const users = getStoreValue().users;
    const creatorId = selectedConversation.creator;
    if (creatorId && !users[creatorId]) {
      dispatch(
          fetchUsersList({
            ids: [creatorId],
            limit: false,
          })
      );
    }
  }
  dispatch(selectConversationSuccess(id));

  dispatch(updatePrimaryView(PrimaryView.ConversationDetail));

  // Go to thread
  if (threadId) {
    dispatch(updateSecondaryView(SecondaryView.THREAD_DETAIL, threadId));
  }
};

export const getAndSelectConversation = (
    id: number,
    conversationType: TConversationType
): ThunkActionType => async (dispatch, getStoreValue) => {
  const { conversations, selectedConversationId, authUser } = getStoreValue();
  if (!id) return false;

  if(selectedConversationId && id === selectedConversationId) return true;

  let selectedConversation = conversations[id];
  let fetchConversationResponse;
  if (!selectedConversation) {
    try {
      switch (conversationType) {
        case ConversationType.DirectMessage:
        case ConversationType.Group:
            fetchConversationResponse = await ConversationService.fetchDmgById(id);
            break;
        case ConversationType.Private:
            fetchConversationResponse = await ConversationService.fetchChannelById(id);
            break;
        case ConversationType.Public:
            fetchConversationResponse = await ConversationService.fetchPublicChannelById(id);
            break;
        default:
          break;
      }
      // Check conversation
      selectedConversation = fetchConversationResponse.data;
      // dispatch(updateConversationSuccess(selectedConversation));
    } catch (error) {
        return false;
    }
  }
  // Selected channel / dmgs
  // Check members of channel / dmgs
  const isMember = selectedConversation && selectedConversation.members.includes(authUser.id);
  if (!isMember && selectedConversation.conversationType !== ConversationType.Public) return false;
  const users = getStoreValue().users;
  const creatorId = selectedConversation.creator;
  if (creatorId && !users[creatorId]) {
    dispatch(
      fetchUsersList({
        ids: [creatorId],
        limit: false,
      })
    );
  }
  dispatch(selectConversationSuccess(id));
  dispatch(updatePrimaryView(PrimaryView.ConversationDetail));
  return true;
};

/**
 * Add a user to a channel
 */
export const addChannelMember = (
  channelId: number,
  members: number[]
): ThunkActionType => async (dispatch: DispatchType) => {
  const requestData = members.map((id) => ({ userId: id }));
  const response = await ConversationService.addChannelMember(
    channelId,
    requestData
  );
  const { data } = response;
  dispatch(addChannelMemberSuccess(data));
  return data;
};

/**
 * Add users to a group
 */
export const addGroupMember = (
  channelId: number,
  members: number[]
): ThunkActionType => async (dispatch: DispatchType) => {
  const requestData = members.map((id) => {
    return {
      userId: id,
      isAdmin: false, // We're adding non-admin members, for admins, use other function
    };
  });

  const response = await ConversationService.addGroupMember(
    channelId,
    requestData
  );
  const { data } = response;

  dispatch(addChannelMemberSuccess(data));
  // dispatch(updateDMGName(channelId));
  return data;
};

export const makeChannelAdmin = (
  channelId: number,
  userId: number
): ThunkActionType => async (dispatch: DispatchType) => {
  const response = await ConversationService.changeChannelAdmin(
    channelId,
    userId,
    { isAdmin: true }
  );

  dispatch(makeChannelAdminSuccess(response.data));
};

export const removeChannelAdmin = (
  channelId: number,
  userId: number
): ThunkActionType => async (dispatch: DispatchType) => {
  const response = await ConversationService.changeChannelAdmin(
    channelId,
    userId,
    { isAdmin: false }
  );

  dispatch(removeChannelAdminSuccess(response.data));
};

export const removeChannelMember = (
  channelId: number,
  userId: number
): ThunkActionType => async (dispatch: DispatchType, getStoreValue) => {
  const response = await ConversationService.removeChannelMember(
    channelId,
    userId
  );

  dispatch(removeChannelMemberSuccess(response.data));
};

export const removeGroupMember = (
  channelId: number,
  userId: number
): ThunkActionType => async (dispatch: DispatchType) => {
  const response = await ConversationService.removeGroupMember(
    channelId,
    userId
  );

  await dispatch(removeChannelMemberSuccess(response.data));
  // dispatch(updateDMGName(channelId));
};

export const searchPublicChannels = (data: any): ThunkActionType => async (
  dispatch,
  getStoreValue
) => {
  const id = getStoreValue().selectedTeamId;
  const requestData = {
    ...data,
    team: id,
  };
  const response = await ConversationService.searchPublicChannels(requestData);
  dispatch(updateFetchConversationListSuccess(keyBy(response.data.results, 'id')));
  return response;
};

export const getPublicChannelBySlug = (slug: any): ThunkActionType => async (
  dispatch,
  getStoreValue
) => {
  const id = getStoreValue().selectedTeamId;
  const requestData = {
    team: id,
  };
  const response = await ConversationService.publicChannelBySlug(slug, requestData);
  if (response && response.data) {
    const updatedObj = {}
    updatedObj[response.data.id] = response.data
    dispatch(updateFetchConversationListSuccess(updatedObj));
  }
  return response;
}

export const joinChannel = (data: any): ThunkActionType => async (dispatch) => {
  const requestData = {
    ...data,
  };
  await ConversationService.joinChannel(requestData.id);
  dispatch(updateSecondaryView(null));
};

interface IChannelMembership {
  userId: number;
  channel: number;
  creator?: number;
  created: string;
  modified: string;
}


export const realtimeCreateConversation = (
  payload: any
): ThunkActionType => async (dispatch: DispatchType, getStoreValue) => {
  if (payload.conversationType === ConversationType.DirectMessage) {
    dispatch(
      fetchUsersList({
        ids: uniq(payload.members),
        limit: false,
      })
    );
    const { authUser, users } = getStoreValue();
    const members = payload.members.filter((userId) => userId !== authUser.id);
    payload.conversationName = users[members[0]].fullName;
  }
  dispatch(createConversationSuccess(payload));
};
/**
 * This function handles JOIN_CONVERSATION for different cases
 * - When users are added to channels/groups
 * - When a user join public channel
 *
 * At the widest level, the payload can contain memberships of different users
 * in different channels. However, at the moment, we'll gate-keep the condition:
 * This payload array contains only memberships from a same channel.
 *
 * In the future, if this condition is relax, just remove the check and it
 * should still work as expected
 */
export const realtimeJoinChannel = (
  payload: IChannelMembership[]
): ThunkActionType => async (dispatch: DispatchType, getStoreValue) => {

  const { authUser, users, selectedTeamId, conversations } = getStoreValue();

  const channelList = uniq(payload.map((p) => p.channel));
  const userIds = uniq(payload.map((p) => p.userId))
  const creators = uniq(payload.map((p) => p.creator))

  if (!channelList || (channelList && channelList.length !== 1) 
    || !creators || (creators && creators.length !== 1)) {
    throw Error(
      'The payload should only contain memberships from a single channel'
    );
  }

  await dispatch(fetchChannelById(channelList[0]));

  // Fetch profile of new added member if not in users reducer
  const ids = userIds.filter(i => !users[i])
  await dispatch(
    fetchUsersList({
      ids,
      limit: false,
    })
  );

  dispatch(addChannelMemberSuccess(payload));

  if (userIds.includes(authUser.id) && creators[0] === authUser.id) {
    // This user actively joins this channel
    // If that channel is in the currently selected team,
    // We jump to that channel
    const channel = conversations[channelList[0]];

    if (
      channel &&
      channel.conversationType === ConversationType.Public &&
      channel.team === selectedTeamId
    ) {
      dispatch(selectConversation(channelList[0]));
    }
  }
};

export const toggleFavorite = (id: number): ThunkActionType => async (
  dispatch,
  getStoreValue
) => {
  const conversation = getStoreValue().conversations[id];
  const payload = { isFavorite: !conversation.isFavorite };
  dispatch(updateConversationSuccess(payload));

  if (
    [ConversationType.Public, ConversationType.Private].includes(
      conversation.conversationType
    )
  ) {
    await ConversationService.editChannel(id, payload);
  } else {
    await ConversationService.updateDMG(id, payload);
  }
};

export const onMuteConversation = (id: number): ThunkActionType => async (
  dispatch,
  getStoreValue
) => {
  const conversation = getStoreValue().conversations[id];
  const payload = { isMute: !conversation.isMute };
  dispatch(updateConversationSuccess(payload));

  if (
    [ConversationType.Public, ConversationType.Private].includes(
      conversation.conversationType
    )
  ) {
    await ConversationService.editChannel(id, payload);
  } else {
    await ConversationService.updateDMG(id, payload);
  }
};

export const onHideConversation = (id: number): ThunkActionType => async (
  dispatch,
  getStoreValue
) => {
  const { conversations } = getStoreValue();
  const conversation = conversations[id];

  const payload = { isHide: !conversation.isHide };
  dispatch(updateConversationSuccess(payload));

  if (
    [ConversationType.Public, ConversationType.Private].includes(
      conversation.conversationType
    )
  ) {
    await ConversationService.editChannel(id, payload);
  } else {
    await ConversationService.updateDMG(id, payload);
  }
  // TODO what happend if hide default channel ?
  // if ( selectedConversationId === id && payload.isHide) {
  //   const defaultChannel = getDefaultChannel(getStoreValue());
  //   dispatch(selectConversation(defaultChannel));
  //   dispatch(updateSecondaryView(null));
  // }
};

export const onArchivedChannel = (id: number): ThunkActionType => async (
  dispatch,
  getStoreValue
) => {
  const { conversations, selectedConversationId } = getStoreValue();
  const conversation = conversations[id];

  const payload = { isArchived: !conversation.isArchived };
  if (
    [ConversationType.Public, ConversationType.Private].includes(
      conversation.conversationType
    )
  ) {
    await ConversationService.editChannel(id, payload);
    if ( selectedConversationId === id && payload.isArchived) {
      dispatch(updateSecondaryView(null));
      const defaultChannel = getDefaultChannel(getStoreValue());
      dispatch(selectConversation(defaultChannel));
    }
    dispatch(updateConversationSuccess(payload));
  }
};
/**
 * Check if a DMG conversation is existed by its members
 */
export const checkDMG = (members: number[]): ThunkActionType => async (
  dispatch: DispatchType
) => {
  const response = await ConversationService.checkDMG({ members });
  const { data } = response;
  const dmg = keyBy([data], 'id');

  dispatch(fetchConversationListSuccess(dmg));
  return data;
};

/**
 * Create a new DMG conversation
 */
export const createDMG = (members: number[]): ThunkActionType => async (
  dispatch: DispatchType
) => {
  const response = await ConversationService.createDMG({ members });
  const { data } = response;
  const dmg = keyBy([data], 'id');

  dispatch(fetchConversationListSuccess(dmg));
  return data;
};

/**
 * Get or create a new DMG
 *
 * This function executes the flow when a user tries to create a new DMG.
 * It checks if the DMG is existed. If so, return the DMG. Otherwise, it'll try to create
 * a new DMG
 */
export const getOrCreateDMG = (members: number[]): ThunkActionType => async (
  dispatch: DispatchType
) => {
  let created = false;
  let conversation;

  try {
    conversation = await dispatch(checkDMG(members));
    return { conversation, created };
  } catch (err) {
    try {
      conversation = await dispatch(createDMG(members));
      created = true;
      return { conversation, created };
    } catch (error) {
      return Promise.reject(err);
    }
  }
};

export const updateChannelMention = (
  channelId: number
): ThunkActionType => async (dispatch) => {
  dispatch(updateChannelMentionSuccess(channelId));
};

export const updateChannelUnread = (
  channelId: number
): ThunkActionType => async (dispatch) => {
  dispatch(updateChannelUnreadSuccess(channelId));
};

export const realtimeAssignChannelAdmin = (payload): ThunkActionType => async (
  dispatch: DispatchType
) => {
  const { isAdmin } = payload;
  if (isAdmin) {
    dispatch(makeChannelAdminSuccess(payload));
  } else {
    dispatch(removeChannelAdminSuccess(payload));
  }
};

export const realtimeDeleteConversation = (payload): ThunkActionType => async (
  dispatch,
  getStoreValue
) => {
  const { selectedConversationId } = getStoreValue();
  if (selectedConversationId === payload) {
    const defaultChannel = getDefaultChannel(getStoreValue());
    dispatch(selectConversation(defaultChannel));
    dispatch(updateSecondaryView(null));
  }
  await dispatch(deleteConversationSuccess(payload));
  await dispatch(deleteAllMessageInChannel(payload));
};

export const realtimeLeaveConversation = (payload): ThunkActionType => async (
  dispatch: DispatchType,
  getStoreValue
) => {
  const { channel: channelId, userId } = payload;
  const { conversations, authUser, selectedTeamId } = getStoreValue();
  const conversation = conversations[channelId];
  // Conversation in diffrent team and not loaded yet
  if (!conversation) return;
  if (userId === authUser.id) {
    dispatch(deleteConversationSuccess(channelId));
  } else {
    dispatch(leaveConversationSuccess(payload));
  }
  
  if (userId === authUser.id && conversation.team === selectedTeamId) {
    const defaultChannel = getDefaultChannel(getStoreValue());
    dispatch(selectConversation(defaultChannel));
    dispatch(updateSecondaryView(null));
  }
};

export const realtimeRemoveChannelMember = (payload): ThunkActionType => async (
  dispatch: DispatchType,
  getStoreValue
) => {
  dispatch(removeChannelMemberSuccess(payload));
  dispatch(emptySecondaryView(payload));
};

export const realtimeReadChannel = (payload: IReadChannelPayload): ThunkActionType => async (dispatch: DispatchType, getStoreValue) => {
  dispatch(getNotificationsSuccess([payload]))
  const { selectedConversationId,  } = getStoreValue();
  const { channel, isRead } = payload;
  if (selectedConversationId === channel && isRead) {
    dispatch(resetNewUnreadMessagesuccess())
  }
};

export const dmUserIdSlice = createSlice({
  name: 'dmUserId',
  initialState: null,
  reducers: {
    createDmUserIdSuccess: (_, { payload }) => payload,
  },
});

export const { createDmUserIdSuccess } = dmUserIdSlice.actions;

export const dmUserId = dmUserIdSlice.reducer;

export const getHiddenConversations = (data): ThunkActionType => async (
  dispatch: DispatchType, getStoreValue
) => {

  const { selectedTeamId } = getStoreValue();
  const dataRequest: any = {};
  dataRequest.isHide = true;
  dataRequest.conversationType = [ConversationType.Group, ConversationType.DirectMessage];
  if (data && !data.groupAndDmg) {
    dataRequest.team = selectedTeamId;
    dataRequest.conversationType = [ConversationType.Public, ConversationType.Private];
  }
  if (data && data.keyword) {
    dataRequest.keyword = data.keyword
  }
  if (data && data.page) {
    dataRequest.page = data.page
  }
  const response = await ConversationService.searchChannelsDmgs(dataRequest);
  dispatch(updateFetchConversationListSuccess(keyBy(response.data.results, 'id')));
  return response;
};

export const getArchivedChannels = (data: any): ThunkActionType => async (
  dispatch,
  getStoreValue
) => {
  const id = getStoreValue().selectedTeamId;
  const requestData = {
    ...data,
    team: id,
  };
  const response = await ConversationService.fetchArchivedChannels(requestData);
  dispatch(updateFetchConversationListSuccess(keyBy(response.data.results, 'id')));
  return response;
};

export const searchChannel = (data: any, url?: string): ThunkActionType => async (
  dispatch: DispatchType, getStoreValue
) => {
  const { selectedTeamId } = getStoreValue();
  const dataRequest: any = {};
  dataRequest.isHide = false;
  dataRequest.team = selectedTeamId;
  if (data && data.keyword) {
    dataRequest.keyword = data.keyword
  }
  if (data && data.page) {
    dataRequest.page = data.page
  }
  const response = await ConversationService.searchChannelsDmgs(dataRequest, url);
  dispatch(updateFetchConversationListSuccess(keyBy(response.data.results, 'id')));
  return response
};

export const searchGroupAndDMG = (data: any, url?: string): ThunkActionType => async (
  dispatch: DispatchType, getStoreValue
) => {
  const dataRequest: any = {}
  dataRequest.isHide = false
  
  if (data && data.keyword) {
    dataRequest.keyword = data.keyword
  }
  if (data && data.page) {
    dataRequest.page = data.page
  }
  const response = await ConversationService.searchChannelsDmgs(dataRequest, url);
  dispatch(updateFetchConversationListSuccess(keyBy(response.data.results, 'id')));
  return response
};

export const fetchReconnectChannelsDmgsList = (): ThunkActionType => async (dispatch, getStoreValue) => {
  const { conversations, selectedTeamId } = getStoreValue();
  const data = [];
  Object.keys(conversations).forEach((conversation_id) => {
      if (conversations[conversation_id] && conversations[conversation_id].id) {
        data.push({
          id: conversations[conversation_id].id,
          updatedActionTime: conversations[conversation_id].updatedActionTime
        })
      }
    }
  );
  const response = await ConversationService.fetchReconnectChannelsDmgsList(selectedTeamId, data);
  const removedConversation = [];
  // Remove channel
  response.data.results.forEach((conversation, index) => {
    if(conversation.isRemoved) {
      dispatch(deleteConversationSuccess(conversation.id));
      removedConversation.push(conversation.id)
    }
  });
  const reconnectChannelsDmgsList = keyBy(response.data.results.filter((conversation) => !removedConversation.includes(conversation.id)), 'id');
  dispatch(fetchConversationListSuccess(reconnectChannelsDmgsList));
  return reconnectChannelsDmgsList
};
