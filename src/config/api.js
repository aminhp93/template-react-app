import config from 'config';
import Auth from '@aws-amplify/auth';
import {
  ConsoleLogger as Logger
} from '@aws-amplify/core';

const logger = new Logger('config/api');
const baseUrl = config.apiUrl;

export async function getHeaders() {
  try {
    const session = await Auth.currentSession();
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${session.idToken.jwtToken}`
    };
  } catch (e) {
    logger.error('getHeaders: Auth.currentSession exception', e);
  }
}

export const filterUrls = {
  skills: `${baseUrl}/api/v3/skills/`,
  locations: `${baseUrl}/api/locations/`,
  programs: `${baseUrl}/api/programs/`,
  positions: `${baseUrl}/api/positions/`,
  companies: `${baseUrl}/api/companies/`,
  sessions: `${baseUrl}/api/sessions/`,
  currentLocations: `${baseUrl}/api/current-locations/`,
};

export const alumniUrls = {
  alumni: `${baseUrl}/api/users/`,
  alumniProfile: (id) => `${baseUrl}/api/users/${id}/`,
  myInfo: `${baseUrl}/api/me/`,
};

export const authenticationUrls = {
  requestChangeEmail: `${baseUrl}/api/users/request-change-email/`,
  changeEmail: `${baseUrl}/api/users/change-email/`,
  updateSettings: `${baseUrl}/api/users/settings/`,
  signOut: `${baseUrl}/api/me/signout/`,
};

export const profileUrls = {
  profile: `${baseUrl}/api/me/`,
  syncProfile: `${baseUrl}/api/users/sync-profile/`,
  session: (id) => `${baseUrl}/api/users/${id}/sessions/`,
  devices: (type) => `${baseUrl}/api/me/device/${type}/`,
  inviteInfo: `${baseUrl}/api/invite-info/`,
};

export const onBoardingUrls = {
  selectSession: `${baseUrl}/api/users/onboarding/select-session/`,
  updateProfile: `${baseUrl}/api/users/onboarding/update-profile/`,
};


export const projectUrls = {
  projects: `${baseUrl}/api/projects/`,
  projectBySlug: (slug) => `${baseUrl}/api/projects/${slug}/`,
  projectsByUserId: (userId) => `${baseUrl}/api/users/${userId}/projects/`,
};

export const postUrls = {
  posts: `${baseUrl}/api/posts/`,
  postById: (id) => `${baseUrl}/api/posts/${id}/`,
  postsBookmarkedByUser: (userId) => `${baseUrl}/api/users/${userId}/bookmarks/`,
  bookmark: `${baseUrl}/api/posts/bookmarks/`,
  vote: `${baseUrl}/api/posts/votes/`,
  postPreview: (postId) => `${baseUrl}/api/posts/${postId}/preview/`,
  linkPreview: `${baseUrl}/api/preview/`,
  categories: `${baseUrl}/api/categories/`,
  topics: `${baseUrl}/api/topics/`,
  bookmarkLists: `${baseUrl}/api/bookmark_lists/`,
  bookmarkListById: (id) => `${baseUrl}/api/bookmark_lists/${id}/`,
};

export const sessionUrls = {
  sessions: `${baseUrl}/api/sessions/`,
  checkSession: `${baseUrl}/api/sessions/check/`,
};

export const commentUrls = {
  getCommentByParentId: (appLabel, model, parentId, page) => `${baseUrl}/api/comments/?app_label=${appLabel}&model=${model}&eid=${parentId}&page=${page}`,
  postCommentCreate: `${baseUrl}/api/comments/`,
  commentAction: (commentId) => `${baseUrl}/api/comments/${commentId}/`,
  commentThanks: (commentId) => `${baseUrl}/api/comments/${commentId}/thanks`,
};

export const projectScoreUrls = {
  createProjectUrl: `${baseUrl}/api/scores/`,
  getScoreOfProjectUrl: (projectSlug) => `${baseUrl}/api/projects/${projectSlug}/scores/`,
  deleteOrEditProjectScoreUrl: (id) => `${baseUrl}/api/scores/${id}/`,
};

export const EventUrls = {
  getAllOrCreate: `${baseUrl}/api/events/`,
  getDetailOrUpdateOrDelete: (slug) => `${baseUrl}/api/events/${slug}/`,
  eventReservations: (slug) => `${baseUrl}/api/events/${slug}/reservations/`,
  eventGuests: (eventSlug) => `${baseUrl}/api/events/${eventSlug}/guests/`,
};

export const FeedUrls = {
  feed: `${baseUrl}/api/feed/`,
  feedPinned: `${baseUrl}/api/feed/pinned/`,
  postById: (id) => `${baseUrl}/api/feed/${id}/`,
  hidePost: (id) => `${baseUrl}/api/feed/${id}/hide_post/`,
  pinPost: (id) => `${baseUrl}/api/feed/${id}/pin_post/`,
  unpinPost: (id) => `${baseUrl}/api/feed/${id}/unpin_post/`,
  unfollowPost: (id) => `${baseUrl}/api/feed/${id}/unfollow/`,
  followPost: (id) => `${baseUrl}/api/feed/${id}/follow/`,
  thankPost: (id) => `${baseUrl}/api/feed/${id}/thanks/`,
};

export const taggingUrl = {
  searchUser: (value) => `${baseUrl}/api/users/search-user/?name=${value}`,
};

export const RecommendationUrls = {
  recommendations: `${baseUrl}/api/alumni-recommendations/`,
  recommendationById: (id) => `${baseUrl}/api/alumni-recommendations/${id}`,
  recommendationsSheet: `${baseUrl}/api/alumni-recommendations/sheet/`,
};

export const downloadLinkUrl = `${config.apiUrl}/api/download-url/`;

export const deviceUrls = {
  apnsDetail: (id) => `${baseUrl}/api/me/device/apns/${id}/`,
  fcmDetail: (id) => `${baseUrl}/api/me/device/gcm/${id}/`,
};

export const MESSAGING_URLS = {
  pusherAuthentication: () => `${baseUrl}/api/pusher/auth/`,
};

export const AgreementUrls = {
  agreementById: id => `${baseUrl}/api/agreements/${id}/`,
  documentByKey: key => `${baseUrl}/api/documents/${key}/`
};

// Messaging v3 endpoints
const baseV3 = `${baseUrl}/api/v3/messaging`;

export const TeamUrls = {
  fetchTeams: `${baseV3}/teams/`,
  fetchTeamById: (teamId) => `${baseV3}/teams/${teamId}/`,
  createTeam: `${baseV3}/teams/`,
  updateTeam: (teamId) => `${baseV3}/teams/${teamId}/`,
  leaveTeam: (teamId) => `${baseV3}/teams/${teamId}/leave/`,
  addTeamMember: (teamId) => `${baseV3}/teams/${teamId}/members/`,
  removeTeamMember: (teamId, userId) => `${baseV3}/teams/${teamId}/members/${userId}/`,
  updateMembership: (teamId, userId) => `${baseV3}/teams/${teamId}/members/${userId}/`,
  orders: `${baseV3}/teams/orders`,
};

export const ConversationUrls = {
  fetchConversationList: `${baseV3}/channels/`,
  createChannel: `${baseV3}/channels/`,
  channelById: channelId => `${baseV3}/channels/${channelId}/`,
  editChannel: (channelId) => `${baseV3}/channels/${channelId}/`,
  deleteChannel: (channelId) => `${baseV3}/channels/${channelId}/`,
  leaveChannel: (channelId) => `${baseV3}/channels/${channelId}/leave/`,
  addChannelMember: (channelId) => `${baseV3}/channels/${channelId}/members/`,
  fetchDMGList: `${baseV3}/dmgs/`,
  createDMG: `${baseV3}/dmgs/`,
  checkDMG: `${baseV3}/dmgs/check-existed/`,
  updateDMG: (id) => `${baseV3}/dmgs/${id}/`,
  dmgById: id => `${baseV3}/dmgs/${id}/`,
  leaveGroup: (id) => `${baseV3}/dmgs/${id}/leave/`,
  searchPublicChannels: `${baseV3}/public-channels/`,
  publicChannelById: channelId => `${baseV3}/public-channels/${channelId}/`,
  publicChannelBySlug: slug => `${baseV3}/public-channels/${slug}/`,
  archivedChannels: `${baseV3}/archived-channels/`,
  joinChannel: (channelId) => `${baseV3}/public-channels/${channelId}/join-channel/`,
  changeChannelAdmin: (channelId, userId) => `${baseV3}/channels/${channelId}/members/${userId}/`,
  removeChannelMember: (channelId, userId) => `${baseV3}/channels/${channelId}/members/${userId}/`,
  addGroupMember: (channelId) => `${baseV3}/dmgs/${channelId}/members/`,
  removeGroupMember: (channelId, userId) => `${baseV3}/dmgs/${channelId}/members/${userId}/`,
  readChannel: (channelId) => `${baseV3}/channels/${channelId}/read/`,
  readDMG: (conversationId) => `${baseV3}/dmgs/${conversationId}/read/`,
  searchChannelsDmgs: `${baseV3}/search-channels-dmgs/`,
  reConnect: (teamId) => `${baseV3}/reconnect/${teamId}/channels-dmgs/`,
};

export const MessagingUserUrls = {
  searchUser: `${baseV3}/users/`,
  updateUserStatus: `${baseV3}/users/status/`,
};

export const MessageUrls = {
  fetchMessageList: `${baseV3}/messages/`,
  fetchSavedMessageList: `${baseV3}/saved-messages/`,
  createMessage: `${baseV3}/messages/`,
  updateMessage: (messageId) => `${baseV3}/messages/${messageId}/`,
  deleteMessage: (messageId) => `${baseV3}/messages/${messageId}/`,
  pinMessage: (messageId) => `${baseV3}/messages/${messageId}/pin/`,
  savedMessage: (messageId) => `${baseV3}/messages/${messageId}/saved/`,
  reactMessage: (messageId) => `${baseV3}/messages/${messageId}/reaction/`,
  searchMessage: `${baseV3}/search/`,
  searchFilterSuggestion: `${baseV3}/search/filter-suggestions/`,
  getMessagesAround: (messageId) => `${baseV3}/messages/${messageId}/around/`,
  reConnect: `${baseV3}/reconnect/messages/`,
};

export const ThreadUrls = {
  fetchThreadList: `${baseV3}/threads/`,
  getThreadDetail: (messageId) => `${baseV3}/threads/${messageId}/`,
  getMarkReadThread: (messageId) => `${baseV3}/threads/${messageId}/read/`
};

export const NotificationUrls = {
  getUserNotifications: (userId) => `${baseV3}/notifications/user/${userId}/`,
  getTeamsNotifications: `${baseV3}/notifications/teams/`,
  getChannelsNotifications: `${baseV3}/notifications/channels/`,
  getDMGsNotifications: `${baseV3}/notifications/dmgs/`,
  getThreadsNotifications: `${baseV3}/notifications/threads/`,
};

export const ReactionUrls = {
  fetchReactions: `${baseV3}/emojis/`,
};

export const ConfigUrls = {
  configByKey: key => `${baseUrl}/api/configs/${key}/`,
};

export const ProfileUrls = {
  update: `${baseUrl}/api/v3/me/`
};

export const UserUrls = {
  updateUserSkill: (userId) => `${baseUrl}/api/v3/users/${userId}/skills/`,
  getSkillList: `${baseUrl}/api/v3/skills/`,
  getUserSkills: (userId) => `${baseUrl}/api/v3/users/${userId}/skills/`,
  updateSkillConfirm: `${baseUrl}/api/v3/skills/confirm/`,
}
