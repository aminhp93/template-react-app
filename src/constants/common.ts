export const ModalKey = {
  CREATE_PROJECT: 'CREATE_PROJECT',
  IMAGE_VIEWER: 'IMAGE_VIEWER',
  CREATE_CHANNEL: 'CREATE_CHANNEL',
  CREATE_TEAM: 'CREATE_TEAM',
  MANAGE_MEMBERS: 'MANAGE_MEMBERS',
  LEAVE_CONFIRM: 'LEAVE_CONFIRM',
  LEAVE_NOTIFICATION: 'LEAVE_NOTIFICATION',
  ADD_MEMBER: 'ADD_MEMBER',
  ADD_MEMBER_CONGRATULATION: 'ADD_MEMBER_CONGRATULATION',
  BROWSE_CHANNEL: 'BROWSE_CHANNEL',
  REMOVE_CHANNEL: 'REMOVE_CHANNEL',
  EDIT_TEAM: 'EDIT_TEAM',
  SET_CHANNEL_TOPIC: 'SET_CHANNEL_TOPIC',
  SET_CHANNEL: 'SET_CHANNEL',
  NOTIFICATION_MANAGEMENT: 'NOTIFICATION_MANAGEMENT',
  EDIT_CHANNEL: 'EDIT_CHANNEL',
  AGREEMENT_FORM: 'AGREEMENT_FORM',
};

export const OnBoardingStep = {
  NOT_STARTED: -1,
  CREATE_ACCOUNT: 1,
  SET_NEW_PASSWORD: 2,
  ASSIGNED_SESSION: 3,
  UPDATE_PROFILE: 4,
  COMPLETE: 100,
};

export const ResponseCode = {
  INVALID_TOKEN: 'token_not_valid',
  SESSION_INVALID_TOKEN: 'session_invalid_token',
  SESSION_INVALID_CODE: 'session_invalid_code',
  NOT_ENOUGH_SPACES: 'not_enough_spaces',
};

import DEFAULT_PROFILE_IMAGE_URL_URL from '@img/default-profile-image.svg';
export const DEFAULT_PROFILE_IMAGE_URL = DEFAULT_PROFILE_IMAGE_URL_URL;

import GUEST_IMAGE_URL_URL from '@img/guest-image.svg';
export const GUEST_IMAGE_URL = GUEST_IMAGE_URL_URL;

export const DEFAULT_TEAM_IMAGE = 'https://via.placeholder.com/40';

import SYSTEM_AVATAR_URL from '@img/system_avatar.png';
export const SYSTEM_AVATAR = SYSTEM_AVATAR_URL;

import ADD_USER_IMAGE_URL from '@img/add-user.png';
export const ADD_USER_IMAGE = ADD_USER_IMAGE_URL;

import BROADCAST_ICON_URL from '@img/bullhorn.svg';
export const BROADCAST_ICON = BROADCAST_ICON_URL;

import SYSTEM_NOTIFICATION_URL from '@img/system_notification.png';
export const SYSTEM_NOTIFICATION = SYSTEM_NOTIFICATION_URL;

export const EventType = {
  UPCOMING: 'upcoming',
  PREVIOUS: 'previous',
};

export const EventTimeZone = {
  pst: 'US/Pacific',
  est: 'EST',
  ct: 'US/Central',
  mt: 'US/Mountain',
};

export const EventStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
};

export const LIMITED_CHARACTERS_LONG_POST = 320;

export const LIMITED_CHARACTERS_LONG_COMMENT = 320;

export const MentionType = {
  CHANNEL: 'CHANNEL',
  HERE: 'HERE',
};

export const AdditionalChannelMentions = [
  {
    name: 'here',
    id: 'here',
  },
  {
    name: 'channel',
    id: 'channel',
  },
];

export const AdditionalChannelModelMentions = [
  {
    target: {
      name: 'here',
      id: 'here',
    },
  },
  {
    target: {
      name: 'channel',
      id: 'channel',
    },
  },
];

export const UpdateAdditionalChannelModelMentions = [
  {
    id: 'here',
    target: {
      name: 'here',
      id: 'here',
    },
  },
  {
    id: 'channel',
    target: {
      name: 'channel',
      id: 'channel',
    },
  },
];

export const ChannelMentionTypeIds = {
  here: 'here',
  channel: 'channel',
};

export const IMAGE_SIZES = {
  small: {
    width: 150,
    height: 150,
  },
  thumbnail: {
    width: 300,
    height: 300,
  },
  normal: {
    width: 600,
    height: 500,
  },

  /*
   Image size intended for display in full-screen window,
   but not the original size of the image.

   - 13" MBP Retina display is effectively 1280x800 (or 1440x900 if it's 2018 or
     above). However the real pixel resolution is 2560x1600 (1280x1600@2x), if
     we use the 1280x800@1x resolution the image will look blurry. Plus we also
     need some extra room for zooming.

   - 2048x2048 fit-inside means the dimension will be at most 2048, depending on
     the picture's orientation. For example my IP8 takes 3448x4592 photos, with
     this settings the dimension of the full-size will be 1538x2048, which
     relatively is a 80% reduction in terms of file size. That should bring the
     file size down to "reasonable" level and further reduction seems
     unnecessary.
   */
  full: {
    width: 2048,
    height: 2048,
  },
};

export const AttachmentTypes = {
  FILE: 'FILE',
  GIF: 'GIF',
};

export const GuestTypes = {
  ADULT: 'adult',
  MINOR: 'minor',
};

export const GUEST_TYPES = [GuestTypes.ADULT, GuestTypes.MINOR];

export const CHAT_PATH = '/messaging';

export const TEAM_URL_PREFIX = `${window.location.host}${CHAT_PATH}/`;

export const GalleryItemType = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  DOC: 'DOC',
};

export const FileIconClassNames = {
  [GalleryItemType.DOC]: 'fa-file-text-o',
  [GalleryItemType.VIDEO]: 'fa-file-video-o',
  [GalleryItemType.AUDIO]: 'fa-file-audio-o',
};

export const EDIT_CHANNEL_TYPE = {
  NAME: 'Name',
  PURPOSE: 'Purpose',
};

export const THREAD_AND_CONERATION_INFO_INDEX = {
  ConversationInfo: 'ConversationInfo',
  ThreadTab: 'ThreadTab',
  ThreadTabConversationInfo: 'ThreadTab-ConversationInfo',
  ConversationInfoThreadTab: 'ConversationInfo-ThreadTab',
};

export const S3_BUCKET_PREFIX = {
  POST: 'post/',
  COMMENT: 'comment/',
  MESSAGE: 'message/',
  TEAM: 'team/',
};

import NOTIFICATION_FAVICON_URL from '@img/favicon_notification.png';

export const FAVICONS = {
  default: {
    url: '/favicon.ico',
    type: 'image/x-icon',
  },
  notification: {
    url: NOTIFICATION_FAVICON_URL,
    type: 'image/png',
  },
};

export const DocumentPathnames = {
  privacyPolicy: '/privacy-policy',
  termOfService: '/term-of-service',
  cookiePolicy: '/cookie-policy',
};

export const PINNED_MESSAGE_HIGHLIGHT_TIMEOUT = 3000;

export const FAQ_LINK =
  'https://docs.google.com/document/d/17ZqaSHbLE4kcXqpcvGuFmHCRwKE5ncmmQFNaPrTkg4Y/edit#';

export const IDLE_TIMEOUT = Number(localStorage.IDLE_TIMEOUT) || 15 * 60 * 1000;

export const MAX_CHARACTER_NAME_COUNT = 80;
export const MAX_CHARACTER_PURPOSE_COUNT = 250;

export const USER_STATUS_TYPE = {
  DONT_CLEAR: "DONT_CLEAR",
  THIRTY_MINUTES: 'THIRTY_MINUTES',
  ONE_HOUR: 'ONE_HOUR',
  FOUR_HOURS: 'FOUR_HOURS',
  TODAY: 'TODAY',
  THIS_WEEK: 'THIS_WEEK',
  CHOOSE_DATE_AND_TIME: 'CHOOSE_DATE_AND_TIME',
}

export const DEFAULT_STATUS_OPTIONS = [
  {
      key: 1,
      content: 'In a meeting',
      emoji: '1f5d3'
  },
  {
      key: 2,
      content: 'Commuting',
      emoji: '1f696'
  },
  {
      key: 3,
      content: 'Out sick',
      emoji: '1f912'
  },
  {
      key: 4,
      content: 'Vacationing',
      emoji: '1f3dd'
  },
  {
      key: 5,
      content: 'Working remotely',
      emoji: '1f3e1'
  }
]

export const DEFAULT_ADD_IMAGE_STATUS = '1f4ac';
