import * as Sentry from '@sentry/react';
import * as React from 'react';
import { Button } from 'antd';
import MessagingModal from 'components/MessagingModal';

import CHANNEL_MENTION_ICON_URL from '@img/channel-mention.png';


export function ChannelMention(
  {
    isOpen,
    onClose,
    onConfirm,
    numOfMembers,
  }
) {
  return (
    <MessagingModal isOpen={isOpen} id="unpinConfirm" close={onClose}>
      <div id="messageConfirmModal">
        <img
          src={CHANNEL_MENTION_ICON_URL}
          alt="Channel mention image"
          className="channel-mention-warning-image"
        />
        <div className="mb-4 text-left ml-1 mb-2 channel-mention-warning-text">
          By using <b>@channel</b>, you are about to notify{' '}
          <b>{numOfMembers} people</b>. Are you sure?
        </div>
        <div className="text-right mt-3 mb-2">
          <Button
            size="large"
            id="confirmButton"
            className="mr-3"
            type="default"
            onClick={onClose}
            tabIndex={1}
          >
            Edit message
          </Button>
          <Button
            size="large"
            id="confirmCancelButton"
            onClick={onConfirm}
            type="primary"
            tabIndex={2}
            autoFocus
          >
            Send it now
          </Button>
        </div>
      </div>
    </MessagingModal>
  );
}
export default Sentry.withProfiler(ChannelMention, { name: "ChannelMention"});
