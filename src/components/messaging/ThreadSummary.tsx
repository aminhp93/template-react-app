import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import pluralize from 'pluralize';
import { distanceInWordsToNow } from 'date-fns';

import { DEFAULT_PROFILE_IMAGE_URL } from 'constants/common';
import { TUser, SecondaryView } from 'types';
import { updateSecondaryView } from 'reducers/views';
import { markReadThread } from 'reducers/threads';

type TProps = {
  threadId: number;
  replyCount: number;
  repliedUsers: number[];
  lastReplyCreated: string;
  users: TUser[];
  updateSecondaryView: any;
  markReadThread: any;
};

class ThreadSummary extends React.PureComponent<TProps> {
  onSelect = () => {
    this.props.updateSecondaryView(SecondaryView.THREAD_DETAIL, this.props.threadId);
    this.props.markReadThread(this.props.threadId);
  };

  render() {
    const { users, replyCount, repliedUsers, lastReplyCreated } = this.props;

    return (
      <div
        className={clsx('thread-bar', { 'popup-size': false /*!fullPage*/ })}
        onClick={this.onSelect}
      >
        {(repliedUsers || []).map((id) => (
          <div className="thread-bar--avatar" key={id}>
            <img
              className="thread-bar--avatar__image"
              src={
                (users[id] && users[id].profileImage) ||
                DEFAULT_PROFILE_IMAGE_URL
              }
              alt={users[id] && users[id].fullName}
            />
          </div>
        ))}
        <span className="thread-bar--reply-count link">
          {pluralize('reply', replyCount, true)}
        </span>
        <div className="thread-bar--description">
          <span className="thread-bar--description__item thread-bar--description__last-reply">
            {distanceInWordsToNow(lastReplyCreated, { addSuffix: true })}
          </span>
          <span className="thread-bar--description__item thread-bar--description__view-thread">
            View thread
          </span>
        </div>
        <i className="fa fa-chevron-right thread-bar--arrow" />
      </div>
    );
  }
}

export default connect(({ users }) => ({ users }), {
  updateSecondaryView,
  markReadThread
})(Sentry.withProfiler(ThreadSummary, { name: "ThreadSummary"}));
