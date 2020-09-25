import axios from 'axios';
import {
  notification
} from 'antd';
import Auth from '@aws-amplify/auth';
import {
  ConsoleLogger as Logger
} from '@aws-amplify/core';
import * as Sentry from '@sentry/browser';
import { dispatch } from 'store';

import {
  ResponseCode
} from 'constants/common';

import { realtimeGlobalSignOut } from 'reducers/users';


const logger = new Logger('request');

const headers = {
  'Content-Type': 'application/json',
};

const client = axios.create({
  headers
});

// Add authenitcation token to request header
client.interceptors.request.use(
  async config => {
    const newConfig = {
      ...config
    };

    // The logout code was removed so it's OK to use token=null here.
    // Worst case scenario the server returns error that are captured
    // for handling later.
    let token = null;

    try {
      const session = await Auth.currentSession();

      // Purposely use `getIdToken()` here. Previously `get` was used, which
      // silently ignore any errors.
      token = session.getIdToken().getJwtToken();
    } catch (e) {
      try {
        // Try refreshing the session, without relying on the cache
        const user = await Auth.currentAuthenticatedUser({
          bypassCache: true
        });
        const session = await Auth.userSession(user);

        // Purposely use `getIdToken()` here. Previously `get` was used, which
        // silently ignore any errors.
        token = session.getIdToken().getJwtToken();
      } catch (e) {
        Sentry.captureException(e);
      }
    }

    if (token) {
      newConfig.headers = config.headers || {};
      newConfig.headers.Authorization = `Bearer ${token}`;
    }
    return newConfig;
  },
  error => {
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (res) => res,
  (err) => {
    logger.error(err);
    if (err.response && err.response.status === 401) {
      const {
        data
      } = err.response;
      if (
        (data.code && data.code === 'token_not_valid') ||
        (data.detail && data.detail === 'Authentication credentials were not provided.')
      ) {
        const {
          pathname
        } = window.location;
        if (!pathname.includes('login')) {
          // performLogout();
          // window.location.href = '/login'
          // Do nothing here, relying on Sentry to capture the relevant
          // information first
          Sentry.captureException(err)
        }
      }
      if (data.detail && data.detail === 'GLOBAL_SIGN_OUT') {
          dispatch(realtimeGlobalSignOut())
      }
      throw err;
    } else if (err.response && err.response.status === 500) {
      Sentry.captureException(err);
      // TODO: display error dialog
    }
    return Promise.reject(err);
  },
);

const request = (options) => {
  const onSuccess = (res) => res;
  const onError = (err) => {
    logger.error(err);
    // const isAuthorizationError = err.response
    //   && (err.response.status === 403 || err.response.status === 401);
    // const isOnBoardingError = err.response
    //   && err.response.status === 400 && err.response.data.code === ResponseCode.SESSION_INVALID_CODE;

    const isEventGuestSpaceError = err.response &&
      err.response.status === 400 && err.response.data.code === ResponseCode.NOT_ENOUGH_SPACES;

    // const isServerError = err.response && err.response.status === 500;
    let errorMessage = 'Error';
    if (err.response && err.response.data) {
      if (err.response.data.error_message) {
        errorMessage = err.response.data.error_message
      } else if (err.response.data.message) {
        errorMessage = err.response.data.message
      } else if (err.response.data.length) {
        errorMessage = err.response.data[0]
      } else if (err.response.data.nonFieldErrors && err.response.data.nonFieldErrors.length) {
        errorMessage = err.response.data.nonFieldErrors[0]
      }
    }

    if (errorMessage && isEventGuestSpaceError) {
      notification.error({
        message: 'Error',
        description: String(errorMessage)
      });
    }

    const error = new Error(errorMessage);
    error.response = err.response;
    throw error;
  };

  return client(options)
    .then(onSuccess)
    .catch(onError);
};

export default request;

const giphyClient = axios.create({ headers });

export const giphyRequest = (options) => {
  const onSuccess = (res) => res;
  const onError = (err) => {
    throw err
  };

  return giphyClient(options).then(onSuccess).catch(onError)
};
