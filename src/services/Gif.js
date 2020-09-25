import request from 'utils/request';

const GifService = {
  async download(url) {
    return request({
      url,
      method: 'GET',
      responseType: 'blob',
    }).then((res) => res);
  },
};

export default GifService;
