import * as Sentry from '@sentry/react';
import * as React from 'react'

import WELCOME_IMAGE_URL from '@img/community-welcome.svg'


function ConversationPlaceholder() {
  return (
    <div className="conversation--default h100">
      <img src={WELCOME_IMAGE_URL} alt="default conversation" />
      <div className="conversation--default__title">
        Welcome to Insight community
      </div>
      <div className="conversation--default__description">
        Collaborate. Contribute. Connect with the Insight Community.
      </div>
    </div>
  );
}

export default Sentry.withProfiler(ConversationPlaceholder, { name: "ConversationPlaceholder"});
