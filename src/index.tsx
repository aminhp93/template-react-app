import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import Auth from '@aws-amplify/auth';
import Storage from '@aws-amplify/storage';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

import store from './store';
import config from './config';
import Amplitude from 'utils/amplitude';

// Import main styles for this application
import './scss/main.scss';

// Containers
import Container from './container';
import UserContextProvider from './containers/authentication';

if (process.env.NODE_ENV === 'production') {
  // This need to be in a separate statement, otherwise fuse-box
  // won't be able to replace it with the static value
  const version = process.env.VERSION;

  Sentry.init({
    ...config.sentry,
    environment: process.env.ENV,
    release: `platform-webapp@${version}`,
    integrations: [new Integrations.BrowserTracing()],
  });
}

window.LOG_LEVEL = localStorage.LOG_LEVEL || 'ERROR';
window.Auth = Auth || {};

Amplitude.init(config.amplitudeApiKey);

Auth.configure(config.cognito);

Storage.configure(config.s3);

window.__store = window.__store || store;

const render = () => {
  ReactDOM.render(
    <Provider store={window.__store}>
      <UserContextProvider>
        <Container />
      </UserContextProvider>
    </Provider>,
    document.getElementById('root')
  );
};

render();
