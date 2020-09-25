import request from 'utils/request';
import { getHeaders, FeedUrls } from 'config/api';

const FeedService = {
  async getFeed(params) {
    return request({
      method: 'GET',
      headers: await getHeaders(),
      url: `${FeedUrls.feed}?p=0`,
      params,
    }).then((res) => res);
  },
  async getFeedPinned(params) {
    return request({
      method: 'GET',
      headers: await getHeaders(),
      url: `${FeedUrls.feed}?p=1`,
      params,
    }).then((res) => res);
  },
  async createPost(data) {
    return request({
      method: 'POST',
      headers: await getHeaders(),
      url: FeedUrls.feed,
      data,
    }).then((res) => res);
  },
  async updatePost(data, eid) {
    return request({
      method: 'PUT',
      headers: await getHeaders(),
      url: `${FeedUrls.feed}${eid}/`,
      data,
    }).then((res) => res);
  },
  async getFeedById(eid) {
    return request({
      method: 'get',
      headers: await getHeaders(),
      url: FeedUrls.postById(eid),
    }).then((res) => res);
  },
  async deletePost(postId) {
    return request({
      method: 'delete',
      headers: await getHeaders(),
      url: FeedUrls.postById(postId),
    }).then((res) => res);
  },
  async hidePost(postId) {
    return request({
      method: 'PATCH',
      headers: await getHeaders(),
      url: FeedUrls.hidePost(postId),
    }).then((res) => res);
  },
  async pinPost(postId) {
    return request({
      method: 'PATCH',
      headers: await getHeaders(),
      url: FeedUrls.pinPost(postId),
    }).then((res) => res);
  },
  async unpinPost(postId) {
    return request({
      method: 'PATCH',
      headers: await getHeaders(),
      url: FeedUrls.unpinPost(postId),
    }).then((res) => res);
  },
  async unfollowPost(eid, data) {
    return request({
      method: 'POST',
      headers: await getHeaders(),
      url: FeedUrls.unfollowPost(eid),
      data,
    }).then((res) => res);
  },
  async followPost(eid, data) {
    return request({
      method: 'POST',
      headers: await getHeaders(),
      url: FeedUrls.followPost(eid),
      data,
    }).then((res) => res);
  },
  async thankPost(postId) {
    return request({
      method: 'POST',
      headers: await getHeaders(),
      url: FeedUrls.thankPost(postId),
    }).then((res) => res);
  },
  async unthankPost(postId) {
    return request({
      method: 'DELETE',
      headers: await getHeaders(),
      url: FeedUrls.thankPost(postId),
    }).then((res) => res);
  },
};

export default FeedService;
