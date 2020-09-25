import request from 'utils/request';
import {
  profileUrls, getHeaders,
  ProfileUrls
} from 'config/api';


export type UpdateProfilePayload = {
  password?: string

  profileImage?: string
  firstName?: string
  lastName?: string
  position?: string
  employer?: string
  linkedin?: string
};


export const ProfileService = {
  async getInfo() {
    return request({
      method: 'get',
      url: profileUrls.profile,
    });
  },

  async updateInfo(data: UpdateProfilePayload) {
    return request({
      method: 'patch',
      url: ProfileUrls.update,
      data,
    });
  },

  async getSessions(userId) {
    return request({
      method: 'get',
      headers: await getHeaders(),
      url: profileUrls.session(userId),
    }).then((res) => res);
  },
  async addSession(data, userId) {
    return request({
      method: 'post',
      headers: await getHeaders(),
      url: profileUrls.session(userId),
      data,
    }).then((res) => res);
  },
  async setOnboarding(step) {
    return request({
      method: 'put',
      headers: await getHeaders(),
      url: profileUrls.profile,
      step,
    }).then((res) => res);
  },
  async syncProfile(data) {
    return request({
      method: 'put',
      headers: await getHeaders(),
      url: profileUrls.syncProfile,
      data,
    }).then((res) => res);
  },
  async registerDevice(data, type) {
    return request({
      method: 'post',
      headers: await getHeaders(),
      url: profileUrls.devices(type),
      data,
    });
  },
  async getInviteInfo() {
    return request({
      method: 'get',
      headers: await getHeaders(),
      url: profileUrls.inviteInfo,
    }).then((res) => res);
  },
};

export default ProfileService;
