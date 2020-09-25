import * as Sentry from '@sentry/react';
import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';

import ConfirmModal from './ConfirmModal';
import { deleteChannel } from 'reducers/conversations';
import { ModalKey } from 'types';

export type IProps = {
  deleteChannel?: any;
  onModalClose: any;
  selectedConversation: any;
}

export type IState = {
}

class DeleteChannelConfirmWrapper extends React.PureComponent<IProps, IState> {

  render() {
    const { deleteChannel, onModalClose} = this.props;
   return (
    <ConfirmModal
      modalKey={ModalKey.DELETE_CHANNEL}
      okText="Delete channel"
      title="Delete channel"
      destructive={true}
      onOk={deleteChannel}
      onCancel={onModalClose}
      disabled={false}
    >
      <p>
        All data and documents in this channel will be permanently deleted.
        <br />
        Do you still want to delete this channel?
      </p>
    </ConfirmModal>
   )
  }
}

const mapStateToProps = (state) => {
  const conversations = get(state, 'conversations') || {};
  const selectedConversationId = get(state, 'selectedConversationId');
  return {
    selectedConversation: conversations[selectedConversationId] || {}
  }
}

const mapDispatchToProps = {
  deleteChannel
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(DeleteChannelConfirmWrapper, { name: "DeleteChannelConfirmWrapper"}));
