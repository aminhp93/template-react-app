/* eslint-disable */
import isURL from 'validator/lib/isURL';

export const isEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export const isValidUrl = (url) => {
  if (!url) return false;
  return isURL(url, {
    protocols: ['http','https'],
    require_tld: true,
    require_protocol: false,
    require_host: true,
    require_valid_protocol: true,
    allow_underscores: true,
    host_whitelist: false,
    host_blacklist: false,
    allow_trailing_dot: false,
    allow_protocol_relative_urls: false
  });
}

export const isValidSessionCode = (code) => {
  const re = /^\d+$/;
  return re.test(String(code).toLowerCase()) && String(code).length === 6;
};
