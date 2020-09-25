import request from 'utils/request';
import { filterUrls, getHeaders } from 'config/api';

const FilterService = {
  async getFilterValues(filterType, params) {
    return request({
      method: 'get',
      url: filterUrls[filterType],
      headers: await getHeaders(),
      params,
    }).then((res) => res);
  },
};

export default FilterService;
