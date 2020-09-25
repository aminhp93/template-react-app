import { createSlice } from '@reduxjs/toolkit';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { ThunkActionType, DispatchType } from 'store';
import { format } from 'date-fns';
import { keyBy, cloneDeep, groupBy } from 'lodash';

import { TMessage, ConversationType, SecondaryView } from 'types';
import MessageService from 'services/Message';
import { markReadThread } from 'reducers/threads'
import { fetchUsersForListMessage, fetchUsersList } from 'reducers/users';
import { updateSecondaryView } from 'reducers/views';
import {
  getChannelsNotifications,
  getDMGsNotifications,
} from 'reducers/conversations';
import { fetchThreadNotificationForTeam } from 'reducers/threadNotifications';
import { extractMentionIdFromRawText } from 'utils/messagingContent';
import { fetchTeamNotifications } from 'reducers/teamNotifications';
import { fetchUserNotification } from 'reducers/userNotifications';
import { updateConversationSuccess } from 'reducers/conversations';

const logger = new Logger(__filename);

export interface IMessageListDataRequest {
  // FIXME: is it required? fetchMessageList seems to always use selectedConversationId anyway
  channel?: number;
  isPinned?: boolean;
  before?: string;
  after?: string;
}

export const messageSlice = createSlice({
  name: 'messages',
  initialState: {},
  reducers: {
    fetchMessageListSuccess: (state, { payload }) => {
      // Keep lastSeen props when the payload don't have lastSeen props
      const ids = Object.keys(payload);
      for (const i in ids) {
        const id = ids[i];
        if (state[id] && state[id].lastSeen && !payload[id].lastSeen) {
          payload[id].lastSeen = state[id].lastSeen
        }
      }

      return { ...state, ...payload }
    },
    fetchMessageListFromThreadSuccess: (state, { payload }) => {
      let childrenMessages = [];
      const keys = Object.keys(payload);
      for (const index in keys) {
        const value = payload[keys[index]];
        const { parent, listMessages } = value;
        if (!parent && listMessages.length > 0) {
          childrenMessages = childrenMessages.concat(listMessages);
        }
      }
      const mappedChildrenMessages = keyBy(childrenMessages, 'id');
      return { ...state, ...payload, ...mappedChildrenMessages };
    },
    createMessageSuccess: (state, { payload }) => {
      const { id, temporaryId } = payload;

      state[id] = {...state[id], ...payload };

      if (temporaryId && temporaryId.length > 0) {
        delete state[temporaryId];
      }
    },
    deleteMessageSuccess: (state, { payload }) => {
      delete state[payload];
    },
    updateMessageSuccess: (state, { payload }) => {
      const { id } = payload;
      state[id] = { ...state[id], ...payload };
    },
  },
});

export const {
  fetchMessageListSuccess,
  createMessageSuccess,
  deleteMessageSuccess,
  updateMessageSuccess,
  fetchMessageListFromThreadSuccess,
} = messageSlice.actions;

export const messages = messageSlice.reducer;

/**
 * This function create a temporary message on local for displaying
 * immediately while waiting for the actual message to be created/updated
 * and returned from the API.
 */
const createTemporaryMessage = (
  payload: Partial<TMessage>
): ThunkActionType => async (dispatch, getStoreValue) => {
  const { authUser } = getStoreValue();
  // Create a temporary message for displaying, data on mention and created
  // time might not be correct
  const { mentions, content } = extractMentionIdFromRawText(payload.content);
  const temporaryMessage = {
    ...payload,
    content,
    mentions,
    creator: authUser.id,
    created: payload.created || format(new Date(), 'YYYY-MM-DDTHH:mm:ss.SSSSSS'),
    isTemporary: true,
  };
  dispatch(createMessageSuccess(temporaryMessage));
  return temporaryMessage;
};

export const sendMessage = (payload: TMessage): ThunkActionType => async (
  dispatch: DispatchType
) => {
  const temporaryMessage = await dispatch(createTemporaryMessage(payload));
  try {
    const message = await dispatch(createMessage(payload));
    dispatch(fetchUsersForListMessage([message]));
    return message;
  } catch (error) {
    // The message is failed to send, need to indicate it needs resending
    temporaryMessage.hasError = true;
    dispatch(createMessageSuccess(temporaryMessage));
  }
};

/**
 * Create a new message
 */
export const createMessage = (
  payload: Partial<TMessage>
): ThunkActionType => async (dispatch) => {
  const response = await MessageService.createMessage(payload);
  const { data } = response;
  dispatch(createMessageSuccess(data));
  return data;
};

export const resendMessage = (
  messageId: string | number
): ThunkActionType => async (dispatch: DispatchType, getStoreValue) => {
  const { messages } = getStoreValue();
  const temporaryMessage = messages[messageId];
  const message = await dispatch(createMessage(temporaryMessage));
  dispatch(fetchUsersForListMessage([message]));
  return message;
};

export const updateMessage = (
  id: number,
  payload: Partial<TMessage>
): ThunkActionType => async (dispatch: DispatchType) => {
  const tempData = { id, ...payload };
  dispatch(createTemporaryMessage(tempData));
  const response = await MessageService.updateMessage(id, payload);
  const { data } = response;
  dispatch(createMessageSuccess(data));
  return data;
};

export const fetchMessageList = (
  request: IMessageListDataRequest,
  url?: string
): ThunkActionType => async (dispatch, getStoreValue) => {
  const { selectedConversationId } = getStoreValue();
  const params = {
    ...request,
    channel: selectedConversationId,
  };
  const response = await MessageService.fetchMessageList(params, url);
  const data = keyBy(response.data.results, 'id');

  dispatch(fetchUsersForListMessage(response.data.results));

  dispatch(fetchMessageListSuccess(data));

  return response;
};

export const deleteMessage = (messageId: number): ThunkActionType => async (
  dispatch,
  getStoreValue
) => {
  await MessageService.deleteMessage(messageId);
  const { secondaryView, selectedThreadDetail } = getStoreValue();
  if (secondaryView === SecondaryView.THREAD_DETAIL && selectedThreadDetail === messageId) {
    dispatch(updateSecondaryView(null))
  }
  dispatch(deleteMessageSuccess(messageId));
};

export const deleteAllMessageInChannel = (channelId: number): ThunkActionType => async (
  dispatch,
  getStoreValue
) => {
  const { messages } = getStoreValue();
  const listMessages = Object.values(messages).filter(i => i.channel === channelId).map(s => s.id);
  for (const i in listMessages) {
    dispatch(deleteMessageSuccess(listMessages[i]));
  }
};

/**
 * Handler for real-time event `SEND_MESSAGE`
 */
export const realtimeSendMessage = (payload): ThunkActionType => async (
  dispatch: DispatchType,
  getStoreValue
) => {
  const { channel, id } = payload;
  const {
    selectedConversationId,
    selectedTeamId,
    conversations,
  } = getStoreValue();
  const conversation = conversations[channel];
  const isThreadReply = payload.parent !== null;
  if (!isThreadReply && channel === selectedConversationId) {
    payload.isNew = true;
  }
  dispatch(fetchUsersForListMessage([payload]));
  dispatch(createMessageSuccess(payload));

  if (isThreadReply) {
    logger.debug('SEND_MESSAGE handler no longer deals with thread reply');
    const { secondaryView, selectedThreadDetail } = getStoreValue();
    if (secondaryView === SecondaryView.THREAD_DETAIL && selectedThreadDetail === payload.parent) {
      // Mark thread is read
      dispatch(markReadThread(payload.parent));
      return
    }
    dispatch(fetchThreadNotificationForTeam(selectedTeamId));
    dispatch(fetchUserNotification());
    return;
  }
  
  if (channel === selectedConversationId) return;

  dispatch(fetchTeamNotifications());
  if (
    conversation && [ConversationType.Group, ConversationType.DirectMessage].includes(
      conversation.conversationType
    )
  ) {
    dispatch(getDMGsNotifications({ channel }));
  } else {
    // Public and Private channels
    dispatch(getChannelsNotifications({ channel }));
  }
  dispatch(fetchThreadNotificationForTeam(selectedTeamId));
  dispatch(fetchUserNotification());

  if (channel !== selectedConversationId) {
    const conv = conversations[channel] || {};
    const { newMessageId } = conv;
    if (!newMessageId) {
      dispatch(updateConversationSuccess({ id: channel, newMessageId: id }))
    }
  }
};

export const realtimeUpdateMessage = (payload): ThunkActionType => async (
  dispatch: DispatchType
) => {
  dispatch(fetchUsersForListMessage([payload]));
  dispatch(updateMessageSuccess(payload));
};

export const realtimeRemoveMessage = (payload: any): ThunkActionType => async (
  dispatch: DispatchType,
  getStoreValue
) => {
  const { secondaryView, selectedThreadDetail } = getStoreValue();
  const { id } = payload;
  if (secondaryView === SecondaryView.THREAD_DETAIL && selectedThreadDetail === id) {
    dispatch(updateSecondaryView(null))
  }
  dispatch(deleteMessageSuccess(id));

};

export const pinMessage = (messageId: number): ThunkActionType => async (
  dispatch: DispatchType
) => {
  const dataRequest = {
    isPinned: true,
  };
  const response = await MessageService.pinMessage(messageId, dataRequest);
  dispatch(updateMessageSuccess(response.data));
};

export const savedMessage = (messageId: number): ThunkActionType => async (
  dispatch: DispatchType, getStoreValue
) => {
  const { messages } = getStoreValue();
  const message = messages[messageId];
  const dataRequest = {
    isSaved: !message.isSaved,
  };
  const response = await MessageService.savedMessage(messageId, dataRequest);
  dispatch(updateMessageSuccess(response.data));
};

export const unpinMessage = (messageId: number): ThunkActionType => async (
  dispatch: DispatchType
) => {
  const dataRequest = {
    isPinned: false,
  };
  const response = await MessageService.pinMessage(messageId, dataRequest);
  dispatch(updateMessageSuccess(response.data));
};


export const addReaction = (data: any): ThunkActionType => async (
  dispatch: DispatchType, getStoreValue
) => {
  const { messages, authUser } = getStoreValue();
  const { messageId, name } = data;
  const dataRequest = {
    isReacted: true,
    reactionName: name
  };
  let reactions = cloneDeep(messages[messageId].reactions)
  // If this reaction is in reacted list
  if (Object.keys(keyBy(reactions, 'name')).includes(name)) {
    reactions.map(i => {
      if (i.name === name && !i.users.includes(authUser.id)) {
        i.users.unshift(authUser.id)
      }
      return i
    })
  } else {
    reactions.push({
      name,
      users: [authUser.id],
    })
  }
  reactions = reactions.sort((a, b) => b.ts - a.ts)
  dispatch(updateMessageSuccess({ id: messageId, reactions }));
  return await MessageService.reactMessage(messageId, dataRequest);
};

export const removeReaction = (data: any): ThunkActionType => async (
  dispatch: DispatchType, getStoreValue
) => {
  const { messages, authUser } = getStoreValue();
  const { messageId, name } = data;
  const dataRequest = {
    isReacted: false,
    reactionName: name
  };
  let reactions = cloneDeep(messages[messageId].reactions);
  reactions.map((i, j) => {
    if (i.name === name) {
      const index = i.users.indexOf(authUser.id)
      index > -1 && i.users.splice(index, 1);
      if (i.users.length === 0) {
        reactions.splice(j, 1)
      }
      return i
    }
  });
  reactions = reactions.sort((a, b) => b.ts - a.ts);
  dispatch(updateMessageSuccess({ id: messageId, reactions }));
  return await MessageService.reactMessage(messageId, dataRequest);
};

export const realtimeAddReaction = (data: any): ThunkActionType => async (
  dispatch: DispatchType, getStoreValue
) => {
  const { messages, authUser } = getStoreValue();
  const { messageId, name, user } = data;
  if (!messages[messageId]) return;
  let reactions = cloneDeep(messages[messageId].reactions);
  const reactionsObj = keyBy(reactions, 'name');
  if (reactionsObj[name] && reactionsObj[name].users.includes(authUser.id) && user === authUser.id) return
    // If this reaction is in reacted list
  if (Object.keys(reactionsObj).includes(name)) {
    reactions.map(i => {
      if (i.name === name && !i.users.includes(user)) {
        i.users.unshift(user)
      }
      return i
    })
  } else {
    reactions.push({
      name,
      users: [user],
    });
    reactions = reactions.sort((a, b) => b.ts - a.ts)
  }

  dispatch(updateMessageSuccess({ id: messageId, reactions }));
  
};

export const realtimeRemoveReaction = (data: any): ThunkActionType => async (
  dispatch: DispatchType, getStoreValue
) => {
  const { messages } = getStoreValue();
  const { messageId, name, user } = data;
  if (!messages[messageId]) return;
  let reactions = cloneDeep(messages[messageId].reactions);

  reactions.map((i, j) => {
    if (i.name === name) {
      const index = i.users.indexOf(user)
      index > -1 && i.users.splice(index, 1);
      if (i.users.length === 0) {
        reactions.splice(j, 1)
      }
      return i
    }
  });
  reactions = reactions.sort((a, b) => b.ts - a.ts);
  dispatch(updateMessageSuccess({ id: messageId, reactions }));
};

export const searchMessage = (dataSearch: any, url?: string): ThunkActionType => async (
  dispatch: DispatchType, getStoreValue
) => {
  const { selectedConversationId, selectedTeamId } = getStoreValue();
  const { textSearch, users } = dataSearch || {};
  const dataRequest: any = {
    keyword: textSearch,
    // channel: selectedConversationId,
    team: selectedTeamId
  };
  if (users && users.length > 0) {
    dataRequest.users = users
  }
  const response = await MessageService.searchMessage(url ? {} : dataRequest, url);
  const data = keyBy(response.data.results, 'id');
  dispatch(fetchUsersForListMessage(response.data.results));

  dispatch(fetchMessageListSuccess(data));

  return response
};

export const getMessagesAround = (id): ThunkActionType => async (
  dispatch: DispatchType, getStoreValue
) => {

  const response = await MessageService.getMessagesAround(id);
  const data = keyBy(response.data, 'id');

  dispatch(fetchUsersForListMessage(response.data));

  dispatch(fetchMessageListSuccess(data));

  return data;
};


export const fetchSavedMessageList = (
  url?: string
): ThunkActionType => async (dispatch, getStoreValue) => {
  const { selectedTeamId } = getStoreValue();
  const params = { team: selectedTeamId };
  const response = await MessageService.fetchSavedMessageList(params, url);
  const data = keyBy(response.data.results, 'id');

  dispatch(fetchUsersForListMessage(response.data.results));

  dispatch(fetchMessageListSuccess(data));

  return response;
};


export const fetchReconnectMessageList = (): ThunkActionType => async (dispatch, getStoreValue) => {
  const { messages, secondaryView, selectedThreadDetail } = getStoreValue();
  const data = [];
  const listConversationHaveMessage = groupBy(messages, 'channel');
  Object.keys(listConversationHaveMessage).forEach((conversation_id, ) => {
    if (conversation_id) {
      const lastedUpdatedActionTimeMessage = listConversationHaveMessage[conversation_id].sort((a, b) => b.updatedActionTime.localeCompare(a.updatedActionTime))[0];
      data.push({
        'channel': conversation_id,
        'updatedActionTime': lastedUpdatedActionTimeMessage.updatedActionTime
      })
    }
  });
  const removedMessages = [];
  const response = await MessageService.fetchReconnectMessageList(data);
  response.data.results.forEach((message, index) => {
    if(message.isRemoved) {
      if (secondaryView === SecondaryView.THREAD_DETAIL && selectedThreadDetail === message.id) {
        dispatch(updateSecondaryView(null))
      }
      dispatch(deleteMessageSuccess(message.id));
      removedMessages.push(message.id)
    }
  });
  const reconnectMessageList = keyBy(response.data.results.filter((message) => !removedMessages.includes(message.id)), 'id');
  dispatch(fetchMessageListSuccess(reconnectMessageList));
  return reconnectMessageList;
};


export const searchFilterSuggestion = (dataSearch: any, url?: string): ThunkActionType => async (
  dispatch: DispatchType, getStoreValue
) => {
  const { selectedConversationId, selectedTeamId, users: storedUsers } = getStoreValue();
  const { textSearch, users } = dataSearch;
  const dataRequest: any = {
    keyword: textSearch,
    team: selectedTeamId,
    // channel: selectedConversationId
  };
  if (users && users.length > 0) {
    dataRequest.users = users
  }
  const response = await MessageService.searchFilterSuggestion(dataRequest, url);
  const ids = response.data.users && response.data.users.map(i => i.id).filter(i => !storedUsers[i])
  if (ids && ids.length > 0) {
    dispatch(fetchUsersList({ ids, limit: false }))
  }
  
  return response
};