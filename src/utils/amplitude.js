import amplitude from 'amplitude-js';

import emitter, { EVENT_KEYS } from './event';

export const eventNames = {
  [EVENT_KEYS.SEARCH_ALUMNI]: 'Fellow Fuzzy Search',
  [EVENT_KEYS.FILTER_ALUMNI]: 'Fellow Filter',
  [EVENT_KEYS.SEARCH_PROJECT]: 'Project Fuzzy Search',
  [EVENT_KEYS.VIEW_PROFILE]: 'View Profile',
  [EVENT_KEYS.VIEW_PROFILE_FROM_SLACK]: 'View Profile from Slack',
  [EVENT_KEYS.VIEW_PROJECT]: 'View Project',
  [EVENT_KEYS.CREATE_PROJECT]: 'Create Project',
  [EVENT_KEYS.EDIT_PROJECT]: 'Edit Project',
  [EVENT_KEYS.VIEW_RESOURCE]: 'View article',
  [EVENT_KEYS.FILTER_PROJECT_BY_SESSION]: 'Filter project by session',
  [EVENT_KEYS.FILTER_PROJECT_BY_CURRENT_SESSION]: 'Filter project by current session',
  [EVENT_KEYS.POST_RESOURCE]: 'Resources - Post A Resource',
  [EVENT_KEYS.VIEW_PROJECT_FROM_DATASET]: 'Resources - View project from dataset',
  [EVENT_KEYS.BROWSE_RESOURCE_DIRECTORY]: 'Resources - Browse Resources Directory',
  [EVENT_KEYS.SEARCH_RESOURCE_TAGS]: 'Resources - Filter By Post Tags',
  [EVENT_KEYS.SEARCH_RESOURCE_CATEGORIES]: 'Resources - Filter By Category',
  [EVENT_KEYS.SEARCH_RESOURCE_TOPIC]: 'Resources - Filter By Topic',
  [EVENT_KEYS.RESOURCE_FUZZY_SEARCH]: 'Resources - Resource Fuzzy Search',
  [EVENT_KEYS.BOOKMARK_RESOURCE]: 'Resources - Bookmark A Resource',
  [EVENT_KEYS.CREATE_NEWS_FEED_POST]: 'News Feed - Create a new Post',
  [EVENT_KEYS.VIEW_NEWS_FEED_POST]: 'News Feed - View Post',
  [EVENT_KEYS.VIEW_NEWS_FEED_FROM_SLACK]: 'News Feed - View Post From Slack',
  [EVENT_KEYS.COMMENT_NEWS_FEED_POST]: 'News Feed - Comment on a news feed posts',
  [EVENT_KEYS.VIEW_NEWS_FEED_POST_COMMENTS]: 'News Feed - View news feed post comments',
  [EVENT_KEYS.THANK_NEWS_FEED_POST]: 'News Feed - Thank a news feed post',
  [EVENT_KEYS.SEND_CHAT_MESSAGE]: 'Messaging - Send chat message',
  [EVENT_KEYS.VIEW_FULL_CHAT_PAGE]: 'Messaging - View full chat page',
  [EVENT_KEYS.VIEW_POPUP_CHAT]: 'Messaging - View popup chat',
  [EVENT_KEYS.OPEN_PROFILE_DIRECT_MESSAGE]: 'Messaging - Open profile direct message',
  [EVENT_KEYS.POST_UPLOAD_IMAGES]: 'News Feed - Post upload images',
  [EVENT_KEYS.SEND_CHAT_IMAGES]: 'Messaging - Send chat images',
  [EVENT_KEYS.CREATE_THREAD]: 'Messaging - Create thread',
  [EVENT_KEYS.VIEW_EVENTS]: 'Events - View events',
  [EVENT_KEYS.VIEW_EVENT_DETAILS]: 'Events - View event details',
  [EVENT_KEYS.RSVP_EVENTS]: 'Events - RSVP',
  [EVENT_KEYS.INVITE_GUEST_EVENTS]: 'Events - Invite guest',
  [EVENT_KEYS.SERVER_ERROR]: 'Server Error',
  [EVENT_KEYS.PIN_MESSAGE]: 'Pinning Message - Pin message',
  [EVENT_KEYS.UNPIN_MESSAGE]: 'Pinning Message - Unpin message',
  [EVENT_KEYS.OPEN_PINNED_MESSAGE]: 'Pinning Message - Open pinned message',
  [EVENT_KEYS.LOG_IN]: 'User logged in',
  [EVENT_KEYS.SEARCH_MESSAGE]: 'Search message'
};

class Amplitude {
  constructor() {
    this.listeners = [
      emitter.addListener(EVENT_KEYS.SETUP_AUTHENTICATED_USER, (data) => {
        this.identify(data.userId);
        if (data.userProperties) this.setUserProperties(data.userProperties);
      }),
      emitter.addListener(EVENT_KEYS.LOG_OUT, () => {
        this.reset();
      }),
      // Data: keywords
      this.addListener(EVENT_KEYS.SEARCH_ALUMNI),
      // Data: filter, keyword
      this.addListener(EVENT_KEYS.FILTER_ALUMNI),
      // Data: keyword
      this.addListener(EVENT_KEYS.SEARCH_PROJECT),
      // Data: user_id
      this.addListener(EVENT_KEYS.VIEW_PROFILE),
      // Data: user_id
      this.addListener(EVENT_KEYS.VIEW_PROFILE_FROM_SLACK),
      // Data: project_name
      this.addListener(EVENT_KEYS.VIEW_PROJECT),
      // Data: session
      this.addListener(EVENT_KEYS.CREATE_PROJECT),
      // Data:
      this.addListener(EVENT_KEYS.EDIT_PROJECT),
      // Data:
      this.addListener(EVENT_KEYS.FILTER_PROJECT_BY_SESSION),
      // Data:
      this.addListener(EVENT_KEYS.FILTER_PROJECT_BY_CURRENT_SESSION),
      // Data: link, tags, categories
      this.addListener(EVENT_KEYS.POST_RESOURCE),
      // Data: link, tags
      this.addListener(EVENT_KEYS.VIEW_RESOURCE),
      // Data: tags
      this.addListener(EVENT_KEYS.SEARCH_RESOURCE_TAGS),
      // Data: categories, topic
      this.addListener(EVENT_KEYS.BROWSE_RESOURCE_DIRECTORY),
      // Data: link, tags, categories, topic
      this.addListener(EVENT_KEYS.BOOKMARK_RESOURCE),
      // Data: project, dataset, categories
      this.addListener(EVENT_KEYS.VIEW_PROJECT_FROM_DATASET),
      // Data: categories
      this.addListener(EVENT_KEYS.SEARCH_RESOURCE_CATEGORIES),
      // Data: topic
      this.addListener(EVENT_KEYS.SEARCH_RESOURCE_TOPIC),
      // Data: keywords, categories, topic, tags
      this.addListener(EVENT_KEYS.RESOURCE_FUZZY_SEARCH),
      // Data: userId, hasLink
      this.addListener(EVENT_KEYS.CREATE_NEWS_FEED_POST),
      // Data: userId, source
      this.addListener(EVENT_KEYS.VIEW_NEWS_FEED_POST),
      // Data: userId, source, feedUrl
      this.addListener(EVENT_KEYS.VIEW_NEWS_FEED_FROM_SLACK),
      // Data:
      this.addListener(EVENT_KEYS.COMMENT_NEWS_FEED_POST),
      // Data:
      this.addListener(EVENT_KEYS.VIEW_NEWS_FEED_POST_COMMENTS),
      // Data:
      this.addListener(EVENT_KEYS.THANK_NEWS_FEED_POST),
      // Data:
      this.addListener(EVENT_KEYS.SEND_CHAT_MESSAGE),
      // Data:
      this.addListener(EVENT_KEYS.VIEW_FULL_CHAT_PAGE),
      // Data:
      this.addListener(EVENT_KEYS.VIEW_POPUP_CHAT),
      // Data:
      this.addListener(EVENT_KEYS.OPEN_PROFILE_DIRECT_MESSAGE),
      // Data:
      this.addListener(EVENT_KEYS.POST_UPLOAD_IMAGES),
      // Data:
      this.addListener(EVENT_KEYS.SEND_CHAT_IMAGES),
      // Data:
      this.addListener(EVENT_KEYS.CREATE_THREAD),
      // Data: user_id
      this.addListener(EVENT_KEYS.VIEW_EVENTS),
      // Data: user_id, event_id, event_name
      this.addListener(EVENT_KEYS.VIEW_EVENT_DETAILS),
      // Data: user_id, event_id, event_name
      this.addListener(EVENT_KEYS.RSVP_EVENTS),
      // Data: user_id, event_id, event_name
      this.addListener(EVENT_KEYS.INVITE_GUEST_EVENTS),
      // Data: message
      this.addListener(EVENT_KEYS.SERVER_ERROR),
      // Data:
      this.addListener(EVENT_KEYS.PIN_MESSAGE),
      // Data:
      this.addListener(EVENT_KEYS.UNPIN_MESSAGE),
      // Data:
      this.addListener(EVENT_KEYS.OPEN_PINNED_MESSAGE),

      this.addListener(EVENT_KEYS.LOG_IN),

      this.addListener(EVENT_KEYS.SEARCH_MESSAGE),
    ];
  }

  addListener = (eventKey) => {
    emitter.addListener(eventKey, (data) => {
      this.track(eventNames[eventKey], data);
    });
  };

  init = (amplitudeToken) => {
    amplitude.init(amplitudeToken);
  };

  track = (event, data = {}) => {
    amplitude.getInstance().logEvent(event, data, (code, body) => {
      // tslint:disable-next-line
    });
  };

  identify = (userId) => {
    amplitude.getInstance().setUserId(userId);
  };

  setUserProperties = (properties) => {
    amplitude.getInstance().setUserProperties(properties);
  };

  reset = () => {
    amplitude.getInstance().setUserId(null);
  };
}

export default new Amplitude();
