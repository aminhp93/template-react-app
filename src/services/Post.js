import request from 'utils/request';
import { postUrls, getHeaders } from 'config/api';
import userInfo from 'utils/userInfo';
import QueryString from 'utils/queryString';

const generateExtraParam = (tagList, categoryList, topic) => {
  const extraParams = {};
  if (tagList && tagList.length > 0) {
    const tags = tagList.filter((tag) => tag.type === 'tag');
    if (tags.length) extraParams.tags = tags.map((tag) => tag.title);
    const keywords = tagList.filter((tag) => tag.type === 'keyword');
    if (keywords.length) extraParams.keywords = keywords.map((tag) => tag.title);
  }
  if (categoryList && categoryList.length > 0) extraParams.categories = categoryList;
  if (topic) extraParams.topic = topic;
  return extraParams;
};

const PostService = {
  async getPosts(params, tagList, categoryList, topic) {
    const extraParams = generateExtraParam(tagList, categoryList, topic);
    // Update urls for sharing purposes
    QueryString.updateUrlWithParams(extraParams);
    return request({
      method: 'get',
      headers: await getHeaders(),
      url: postUrls.posts,
      params: { ...params, ...extraParams },
      paramsSerializer: (p) => QueryString.stringify(p),
    });
  },
  async getMyBookmarks(params, bookmarkListId) {
    const fullParams = { ...params };
    if (bookmarkListId) fullParams.bookmark_list_id = bookmarkListId;
    QueryString.updateUrlWithParams({ bookmarkListId });
    return request({
      method: 'get',
      headers: await getHeaders(),
      url: postUrls.postsBookmarkedByUser(userInfo.getUserId()),
      params: fullParams,
    });
  },
  async getCategories() {
    return request({
      method: 'get',
      headers: await getHeaders(),
      url: postUrls.categories,
    });
  },
  async getTopics() {
    return request({
      method: 'get',
      headers: await getHeaders(),
      url: postUrls.topics,
    });
  },
  async getBookmarkLists() {
    return request({
      method: 'get',
      headers: await getHeaders(),
      url: postUrls.bookmarkLists,
    });
  },
  async createBookmarkLists(data) {
    return request({
      method: 'post',
      headers: await getHeaders(),
      url: postUrls.bookmarkLists,
      data,
    });
  },
  async editBookmarkList(bookmarkListId, data) {
    return request({
      method: 'put',
      headers: await getHeaders(),
      url: postUrls.bookmarkListById(bookmarkListId),
      data,
    });
  },
  async deleteBookmarkList(bookmarkListId) {
    return request({
      method: 'delete',
      headers: await getHeaders(),
      url: postUrls.bookmarkListById(bookmarkListId),
    });
  },
  async createPosts(data) {
    return request({
      method: 'post',
      headers: await getHeaders(),
      url: postUrls.posts,
      data,
    }).then((res) => res);
  },
  async editPost(postId, data) {
    return request({
      method: 'put',
      headers: await getHeaders(),
      url: postUrls.postById(postId),
      data,
    }).then((res) => res);
  },
  async bookmark(data) {
    return request({
      method: 'post',
      headers: await getHeaders(),
      url: postUrls.bookmark,
      data,
    }).then((res) => res);
  },
  async vote(data) {
    return request({
      method: 'post',
      headers: await getHeaders(),
      url: postUrls.vote,
      data,
    }).then((res) => res);
  },
  async getPreview(params) {
    return request({
      method: 'get',
      headers: await getHeaders(),
      url: postUrls.linkPreview,
      params,
      timeout: 5000,
    }).then((res) => res);
  },
  async getPostPreview(postId) {
    return request({
      method: 'get',
      headers: await getHeaders(),
      url: postUrls.postPreview(postId),
      timeout: 5000,
    }).then((res) => res);
  },
  async deletePost(postId) {
    return request({
      method: 'delete',
      headers: await getHeaders(),
      url: postUrls.postById(postId),
    }).then((res) => res);
  },
};

export default PostService;
