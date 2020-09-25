import request from 'utils/request';
import QueryString from 'utils/queryString';
import { projectUrls, getHeaders } from 'config/api';

const ProjectService = {
  async getProjects(params, tagList) {
    return request({
      method: 'get',
      headers: await getHeaders(),
      url: projectUrls.projects,
      params,
      paramsSerializer: (p) => QueryString.stringify(p),
    }).then((res) => ({ ...res, tagList }));
  },
  async getProjectBySlug(slug) {
    return request({
      method: 'get',
      headers: await getHeaders(),
      url: projectUrls.projectBySlug(slug),
    }).then((res) => res);
  },
  async createProject(data) {
    return request({
      method: 'post',
      headers: await getHeaders(),
      url: projectUrls.projects,
      data,
    }).then((res) => res);
  },
  async getProjectsByUserId(userId) {
    return request({
      method: 'get',
      headers: await getHeaders(),
      url: projectUrls.projectsByUserId(userId),
    }).then((res) => res);
  },
  async editProjectBySlug(slug, data) {
    return request({
      method: 'put',
      headers: await getHeaders(),
      url: projectUrls.projectBySlug(slug),
      data,
    }).then((res) => res);
  },
  async deleteProjectBySlug(slug) {
    return request({
      method: 'delete',
      headers: await getHeaders(),
      url: projectUrls.projectBySlug(slug),
    }).then((res) => res);
  },
};

export default ProjectService;
