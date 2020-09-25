import * as Sentry from '@sentry/react';
import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';

import ConfirmModal from './ConfirmModal';
import { leaveChannel } from 'reducers/conversations';
import { ModalKey, ConversationType } from 'types';

export type IProps = {
  /**
   * Callback invoked when the user clicks on `Leave channel` or `Leave group`
   */
  leaveChannel?: any;
  /**
   * Callback invokved when the user clicks on `Close` button or `Cancel` button
   */
  onModalClose: any;
  /**
   * Reference to currently selected converstion in the store
   */
  selectedConversation: any;
};

class LeaveChannelConfirmWrapper extends React.PureComponent<IProps> {
  render() {
    const { leaveChannel, onModalClose, selectedConversation } = this.props;
    const isGroup = selectedConversation.conversationType === ConversationType.Group;
    const text = isGroup ? 'Leave group' : 'Leave channel';
    return (
      <ConfirmModal
        modalKey={ModalKey.LEAVE_CHANNEL}
        destructive={true}
        okText={text}
        title={text}
        onOk={leaveChannel}
        onCancel={onModalClose}
        disabled={false}
      >
        <p>
          Everyone in this {isGroup ? 'group' : 'channel'} will be notified of
          your departure.
          <br />
          {`Are you 100% sure you want to leave ${selectedConversation.conversationName}?`}
        </p>
      </ConfirmModal>
    );
  }
}

const mapStateToProps = (state) => {
  const conversations = get(state, 'conversations') || {};
  const selectedConversationId = get(state, 'selectedConversationId');
  return {
    selectedConversation: conversations[selectedConversationId] || {},
  };
};

const mapDispatchToProps = {
  leaveChannel
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sentry.withProfiler(LeaveChannelConfirmWrapper, { name: "LeaveChannelConfirmWrapper"}));
