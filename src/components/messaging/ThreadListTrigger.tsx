import * as Sentry from '@sentry/react';
import * as React from 'react';
import clsx from 'clsx';
import { Badge } from 'antd';

import THREAD_LIST_ICON_URL from '@img/thread_list.svg';


interface IProps {
  /**
   * Whether there is any unread thread/reply inside thread
   */
  isRead: boolean;
  /**
   * Number of all unread replies in accross all threads of this user
   */
  mentionCount: number | null;
  onClick: () => void;
}

function ThreadListTrigger(props) {
  const { isRead, mentionCount, onClick } = props;
  let badgeThread = null;

  if (mentionCount > 0) {
    badgeThread = (
        <Badge count={mentionCount} className="thread-list-badge" />
    )
  } else if (isRead === false) {
    badgeThread = (
        <Badge className="thread-list-badge" dot />
    )
  }

  return (
    <div
      className="m-conversation_sidebar__thread_list_trigger sidebar-section"
      onClick={onClick}
    >
      <img src={THREAD_LIST_ICON_URL} alt="chat thread icon" className="thread-icon" />
      <span className={clsx({ unread: !isRead })}>{`Threads `}</span>
      {badgeThread}
    </div>
  );
}

export default Sentry.withProfiler(ThreadListTrigger, { name: "ThreadListTrigger"});
