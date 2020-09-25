import config from 'config';
import { giphyRequest } from 'utils/request';

const apiVerstion = 'v1';

export const giphySearch = (q, limit, offset) => giphyRequest({
  url: `${config.giphy.baseUrl}/${apiVerstion}/gifs/search`,
  method: 'GET',
  params: {
    api_key: config.giphy.apiKey,
    q,
    limit,
    offset,
  },
});

export const giphyTrending = (limit, offset) => giphyRequest({
  url: `${config.giphy.baseUrl}/${apiVerstion}/gifs/trending`,
  params: {
    api_key: config.giphy.apiKey,
    limit,
    offset,
  },
});

export const generateGiphyUrl = (gifId) => `https://media.giphy.com/media/${gifId}/giphy.gif`;

export const getLightGiphyUrl = (gif) => gif.images.fixed_width_downsampled.url;
