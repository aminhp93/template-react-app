import request from 'utils/request';
import { projectScoreUrls, getHeaders } from 'config/api';

const ProjectScoreService = {
  async createProject(data) {
    return request({
      method: 'POST',
      headers: await getHeaders(),
      url: projectScoreUrls.createProjectUrl,
      data,
    }).then((res) => res);
  },
  async getScoreOfProject(projectSlug) {
    return request({
      method: 'GET',
      headers: await getHeaders(),
      url: projectScoreUrls.getScoreOfProjectUrl(projectSlug),
    }).then((res) => res);
  },
  async deleteScoreOfProject(scoreId) {
    return request({
      method: 'DELETE',
      headers: await getHeaders(),
      url: projectScoreUrls.deleteOrEditProjectScoreUrl(scoreId),
    }).then((res) => res);
  },
  async editScoreOfProject(scoreId, data) {
    return request({
      method: 'PUT',
      headers: await getHeaders(),
      url: projectScoreUrls.deleteOrEditProjectScoreUrl(scoreId),
      data,
    }).then((res) => res);
  },
};

export default ProjectScoreService;
