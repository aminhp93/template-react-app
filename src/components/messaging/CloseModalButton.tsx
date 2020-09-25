import * as Sentry from '@sentry/react';
import * as React from 'react';

export function CloseModalButton() {
  return <i className="fa fa-times" />;
}
export default Sentry.withProfiler(CloseModalButton, { name: "CloseModalButton"});
