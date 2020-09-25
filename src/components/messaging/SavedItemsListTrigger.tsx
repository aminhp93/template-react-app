import * as Sentry from '@sentry/react';
import * as React from 'react';

import SAVED_ITEMS_ICON_URL from '@img/saved_items.svg';

interface IProps {
  onClick: () => void;
}

function SavedItemsListTrigger(props) {
  const { onClick } = props;

  return (
    <div
      className="m-conversation_sidebar__saved_message_list_trigger sidebar-section"
      onClick={onClick}
    >
      <img src={SAVED_ITEMS_ICON_URL} alt="saved messages icon" className="saved-messages-icon" />
      <span>{`Saved Items `}</span>
    </div>
  );
}

export default Sentry.withProfiler(SavedItemsListTrigger, { name: "SavedItemsListTrigger"});
