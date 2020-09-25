import linkifyHtml from 'linkifyjs/html';
import { isEmpty } from 'lodash';


export function makeFullUrl(urlString) {
  if (!urlString) return '';
  const prefixes = ['http://', 'https://'];
  let hasCorrectPrefix = false;
  prefixes.forEach((prefix) => {
    if (urlString.startsWith(prefix)) hasCorrectPrefix = true;
  });
  return hasCorrectPrefix ? urlString : `http://${urlString}`;
}

export function linkify(urlString) {
  return linkifyHtml(urlString, {
    defaultProtocol: 'https',
    target: '_blank',
  });
}

export function parseUrlParams(search) {
  if (!search) return {};

  return search
    .slice(search.indexOf('?') + 1)
    .split('&')
    .reduce((params, query) => {
      const [key, val] = query.split('=');
      return { ...params, [key]: decodeURIComponent(val) };
    }, {});
}

export function updateUrlParam(key, value) {
  const url = new URL(window.location.href);
  if (value) url.searchParams.set(key, value);
  else url.searchParams.delete(key);
  window.history.pushState(null, '', url.href);
}
