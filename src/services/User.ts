import request from 'utils/request';
import QueryString from 'utils/queryString';
import { UserUrls } from 'config/api';


export const UserService = {
  searchSkill(params?: any) {
    return request({
      method: 'GET',
      url: UserUrls.getSkillList,
      params,
      paramsSerializer: (p) => QueryString.stringify(p)
    });
  },
  getUserSkills(userId) {
    return request({
      method: 'GET',
      url: UserUrls.getUserSkills(userId),
    });
  },
  updateSkillConfirm() {
    return request({
      method: 'POST',
      url: UserUrls.updateSkillConfirm,
    });
  }
}
