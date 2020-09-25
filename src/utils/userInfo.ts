import { DEFAULT_PROFILE_IMAGE_URL } from 'constants/common';
import { TUser, TUserProfileData, TUserPosition } from 'types';

export class UserInfo {
  // data: TUser
  data: any;
  listeners: any;

  constructor(data) {
    this.data = data || null;
    this.listeners = [];
  }

  getUserInfo() {
    return this.data;
  }

  getUserId() {
    return this.data && this.data.id;
  }

  getOnBoardingStep() {
    return this.data && this.data.onboarding_step;
  }

  getUserName() {
    if (this.data) {
      return `${this.data.first_name} ${this.data.last_name}`;
    }
    return '';
  }

  getLinkedInEmail() {
    if (this.data) {
      return this.data.email;
    }
    return '';
  }

  getProfileImage() {
    if (this.data) {
      return (
        (this.data.profile || {}).profile_image || DEFAULT_PROFILE_IMAGE_URL
      );
    }
    return '';
  }

  getCurrentSession() {
    if (this.data) {
      return this.data.current_session;
    }
    return '';
  }

  getRequestedEmail() {
    return this.data ? this.data.requested_email : '';
  }

  isStaff() {
    return (
      this.data &&
      this.data.groups &&
      this.data.groups.filter((group) => group.name === 'staff').length > 0
    );
  }

  isInsightUser() {
    return (
      this.data &&
      this.data.groups &&
      this.data.groups.filter((group) => group.name === 'fellow_alumni')
        .length > 0
    );
  }

  is20AUser() {
    return (
      this.data &&
      this.data.groups &&
      this.data.groups.filter((group) => group.name === 'release_20a').length >
        0
    );
  }

  isToggleFeature(flag) {
    if (this.data) {
      return !(
        this.data.toggle_feature && this.data.toggle_feature[flag] === false
      );
    }
    return false;
  }

  canSeeNewsFeed() {
    return this.data && this.data.show_news_feed === true;
  }

  canManagePlatform() {
    return (
      this.data &&
      this.data.groups &&
      this.data.groups.filter((group) => group.name === 'platform_dev').length >
        0
    );
  }

  canAccessMessaging() {
    return this.isStaff() || this.is20AUser() || this.canManagePlatform();
  }

  shouldSeeMessageDeprecationWarning() {
    return this.isStaff();
  }

  setUserInfo(data) {
    this.data = data;
    this.listeners.forEach((listener) => listener());
  }

  changeReputation(offset) {
    this.data.reputation += offset;
    this.listeners.forEach((listener) => listener());
  }

  onChange(listener) {
    this.listeners.push(listener);
    return () => this.removeListener(listener);
  }

  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }
}

export const getSessionCssClass = (user) => {
  if (!user.current_session) return null;
  return `${user.current_session.program.abbr.toLowerCase()}-accent`;
};

export const getUserSessionDisplay = (user) => {
  if (!user) return null;
  if (!user.current_session) return null;
  // Get session year abbreviations
  const sessYear = user.current_session.name.substring(2, 5);
  const sessProgram = user.current_session.program.abbr;
  const sessLocation = user.current_session.location.abbr;
  return `${sessYear}.${sessProgram}.${sessLocation}`;
};

export const getUserNameDisplay = (user) => {
  if (!user) return 'Insight User';
  return `${user.first_name} ${user.last_name}`;
};

export const getUserAvatar = (user) =>
  (user && user.profile && user.profile.profile_image) ||
  DEFAULT_PROFILE_IMAGE_URL;

export const getPositionDisplay = (user, lineBreak = false) => {
  if (!user) return null;
  if (!user.position) return null;
  return `${user.position} ${lineBreak ? '\n' : ''}@ ${user.company}`;
};

export const getChatUserFullName = (chatUser) =>
  `${chatUser.first_name} ${chatUser.last_name}`;

/**
 * Return the abbreviation of the program of a user
 * E.g.: user's session is 20B.SEC.SV => 'sec'
 * @param user
 */
export const getUserProgramAbbr = (user: TUser) => {
  if (!user.sessionShortName) {
    return '';
  }
  const parts = user.sessionShortName.split('.');
  if (!(parts && parts.length === 3)) {
    return '';
  }
  return parts[1].toLowerCase();
};

/**
 * Return the current user positions, prioritizing users custom values
 * over LinkedIn.
 *
 * @param user TUserProfileData
 * @return positions TUserPosition[]
 */
export const getCurrentPositions = (user: TUserProfileData): TUserPosition[] => {
  if (user.profile?.employer && user.profile?.position) {
    return [{
      employer: user.profile.employer,
      position: user.profile.position
    }];
  }

  return (user.profile?.experiences || []).filter(e => !!e.is_current);
};

export default new UserInfo(null);
