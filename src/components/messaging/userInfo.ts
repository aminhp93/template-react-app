import { DEFAULT_PROFILE_IMAGE_URL } from 'constants/common';

export function isStaff(data) {
    return data && data.groups
      && data.groups.filter((group) => group.name === 'staff').length > 0;
}

export function canManagePlatform(data) {
    return data && data.groups
      && data.groups.filter((group) => group.name === 'platform_dev').length > 0;
}

export function canSeeNewsFeed(data) {
  return data && data.show_news_feed === true;
}

export function is20AUser(data) {
  return data && data.groups
    && data.groups.filter((group) => group.name === 'release_20a').length > 0;
}

export function getProfileImage(data) {
  if (data) {
    return (data.profile || {}).profile_image || DEFAULT_PROFILE_IMAGE_URL;
  }
  return '';
}


export function canAccessMessaging(data) {
  return isStaff(data) || is20AUser(data) || canManagePlatform(data);
}

export function isToggleFeature(data, flag) {
  // if (data) {
  //   return !(data.toggle_feature && data.toggle_feature[flag] === false);
  // }
  return true;
}

export function getUserName(data) {
  if (data) {
    return `${data.first_name} ${data.last_name}`;
  }
  return ''
}