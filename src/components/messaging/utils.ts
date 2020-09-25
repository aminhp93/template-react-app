import _isString from 'lodash/isString';
import _isEmpty from 'lodash/isEmpty';
import { SuccessType, ModalKey, TMessage } from 'types';
import moment from 'moment';

const isString = (value) => {
  if (!_isString(value)) {
    throw new Error(`${value} is not type of String`);
  }
};

const isEmpty = (value) => {
  if (_isEmpty(value)) {
    throw new Error(`${value} cannot be empty`);
  }
};

const colors = [
  '#5779d9',
  '#49a99b',
  '#f28d45',
  '#513f7a',
  '#ff6961',
  '#b1b1b1',
  '#e2b84d',
  '#36454f',
];

/**
 * A simple hash to generate random number from a given string.
 */
const toOneDigitNumber = (value) => {
  const { length } = value;
  let sum = 0;

  for (let index = 0; index < length; index += 1) {
    sum += value.charCodeAt(index);
  }

  return sum % colors.length;
};

/**
 * Pick a color by a given string name
 */
export const getHexColorForName = (value: string): string => colors[toOneDigitNumber(value)];

export const TIMEOUT_ERROR = 2000;

const isUserActive = (user) => user && !user.isRemoved;

export const getChatUserFullName = (user) => {
  if (isUserActive(user)) {
    return user.fullName
  }
  return 'Insight User';
};

export const getUserFullName = (user) => {
  if (user) {
    return user.fullName
  }
  return 'Insight User';
};

export const mapMessageSuccess = (key: ModalKey) => {
  switch (key) {
    case ModalKey.CREATE_CHANNEL:
      return SuccessType.CREATE_CHANNEL_SUCCESS;
    case ModalKey.EDIT_CHANNEL:
      return SuccessType.UPDATE_CHANNEL_SUCCESS;
    case ModalKey.DELETE_CHANNEL:
      return SuccessType.DELETE_CHANNEL_SUCCESS;
    case ModalKey.LEAVE_CHANNEL:
      return SuccessType.LEAVE_CHANNEL_SUCCESS;
    case ModalKey.CREATE_TEAM:
      return SuccessType.CREATE_TEAM_SUCCESS;
    case ModalKey.LEAVE_TEAM:
      return SuccessType.LEAVE_TEAM_SUCCESS;
    case ModalKey.EDIT_TEAM:
      return SuccessType.EDIT_TEAM_SUCCESS;
    default:
      return SuccessType.DEFAULT_SUCCESS
  }
};

export const mapMention = (mentions, users) => {
  const mappedMentions = [];
  mentions.map(item => {
    if (users[item]) {
      mappedMentions.push({
        target: {
          id: users[item].id,
          fullName: users[item].fullName,
          isRemoved: users[item].isRemoved,
        }
      })
    }

  });
  return mappedMentions
};

export const transformProfileToMentionData = (user) => {
  if (!user || !user.id) return null;
  return {
    id: user.id,
    target: {
      id: user.id,
      fullName: user.fullName,
      profileImage: user.profileImage,
      isRemoved: user.isRemoved,
    }
  }
};

export const mapMessageList = (messages, selectedConversationId) => {
  if (!selectedConversationId || !messages) return [];
  return Object.values(messages)
    .filter((item: any) => item.channel === selectedConversationId && !item.parent && !item.isRemoved)
    .sort((a, b) => a.created.localeCompare(b.created));
};

export const mapThreadList = (messages, threads) => {
  if (!messages || !threads ) return []
  return threads.map(item => messages[item])
};

export const mapPinnedMessages = (messages, selectedConversationId) => {
  if (!messages || !selectedConversationId) return [];
  return  Object.values(messages)
  .filter((item: any) => item.channel === selectedConversationId && item.pinnedAt && item.pinnedUser && !item.isRemoved)
  .sort((a, b) => { return b.pinnedAt.localeCompare(a.pinnedAt) })
};

export const mapMessagesInThreadDetail = (parentMessage, messages) => {
  return Object.values(messages)
  .filter((item: any) => item.parent === parentMessage.id && !item.isRemoved)
  .sort((a, b) => a.created.localeCompare(b.created))

};

export const getDefaultChannel = (data) => {
  if (!data) return null;
  const { conversations, selectedTeamId } = data;
  const defaultConversation = Object.values(conversations)
    .filter((item: any) => item.isTeamDefault && item.team === selectedTeamId)
    .sort((a, b) => b.id > a.id);

  if (defaultConversation.length > 0) {
    return defaultConversation[0].id
  } 
  return null
};

export const getDistanceInWordsToNow = (date) => {
  const parsedTimestamp = moment(date).format('hh:mm A');
  const isSevenDateAgo = moment().diff(moment(date).format('YYYY-MM-DD'), 'day');
  if (isSevenDateAgo === 0) {
    return `Today at ${parsedTimestamp}`;
  }
  return moment(date).format('MMM Do [at] hh:mm A');
};

export const formatCount = (count = 0) => (count > 99 ? '99+' : count);

export const normalizeWhitespacesTyping = (text = '') => text.replace(/^\s+/g, '').replace(/\s{2,}/g, ' ');
