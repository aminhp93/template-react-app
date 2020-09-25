import request from 'utils/request';
import { commentUrls, getHeaders } from 'config/api';

const CommentService = {
  async getCommentByParentId(appLabel, modelType, parentId, page) {
    return request({
      method: 'GET',
      headers: await getHeaders(),
      url: commentUrls.getCommentByParentId(appLabel, modelType, parentId, page),
    });
  },
  async postComment(data) {
    return request({
      method: 'POST',
      headers: await getHeaders(),
      url: commentUrls.postCommentCreate,
      data,
    });
  },
  async deleteComment(commentId) {
    return request({
      method: 'DELETE',
      headers: await getHeaders(),
      url: commentUrls.commentAction(commentId),
    });
  },
  async editComment(commentId, data) {
    return request({
      method: 'PUT',
      headers: await getHeaders(),
      url: commentUrls.commentAction(commentId),
      data,
    });
  },
  async thankComment(commentId) {
    return request({
      method: 'POST',
      headers: await getHeaders(),
      url: commentUrls.commentThanks(commentId),
    });
  },
  async unthankComment(commentId) {
    return request({
      method: 'DELETE',
      headers: await getHeaders(),
      url: commentUrls.commentThanks(commentId),
    });
  },
};

export default CommentService;
