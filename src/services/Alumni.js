import request from 'utils/request';
import QueryString from 'utils/queryString';
import { alumniUrls, getHeaders } from 'config/api';

const AlumiService = {
  async getAlumni(params, tagList) {
    return request({
      method: 'get',
      headers: await getHeaders(),
      url: alumniUrls.alumni,
      params,
      paramsSerializer: (p) => QueryString.stringify(p),
    }).then((res) => ({ ...res, tagList }));
  },
  async getAlumniProfile(id) {
    return request({
      method: 'get',
      headers: await getHeaders(),
      url: alumniUrls.alumniProfile(id),
    }).then((res) => res);
  },
};

export default AlumiService;
