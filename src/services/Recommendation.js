import request from 'utils/request';
import { RecommendationUrls, getHeaders } from 'config/api';

const RecommendationService = {
  async createRecommendation(data) {
    return request({
      method: 'post',
      headers: await getHeaders(),
      url: RecommendationUrls.recommendations,
      data,
    }).then((res) => res);
  },
  async getRecommendations(params) {
    return request({
      method: 'get',
      headers: await getHeaders(),
      url: RecommendationUrls.recommendations,
      params,
    }).then(res => res);
  },
  async deleteRecommendation(id) {
    return request({
      method: 'delete',
      headers: await getHeaders(),
      url: RecommendationUrls.recommendationById(id),
    }).then((res) => res);
  },
  async getRecommendationsSheet() {
    return request({
      method: 'get',
      headers: await getHeaders(),
      url: RecommendationUrls.recommendationsSheet,
    }).then((res) => res);
  },
};

export default RecommendationService;
