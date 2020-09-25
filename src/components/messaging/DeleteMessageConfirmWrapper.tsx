import * as Sentry from '@sentry/react';
import React from 'react';
import { connect } from 'react-redux';

import ConfirmModal from './ConfirmModal';
import { deleteMessage } from 'reducers/messages';

import { ModalKey } from 'types';

export type IProps = {
    deleteMessage?: any;
    onModalClose: any;
    messageId: number;
}

export type IState = {
}

class DeleteMessageConfirmWrapper extends React.PureComponent<IProps, IState> {

  render() {
    const { deleteMessage, onModalClose, messageId } = this.props;
   return (
    <ConfirmModal
      modalKey={ModalKey.DELETE_MESSAGE}
      okText="Delete"
      title="Delete message"
      destructive={true}
      onOk={() => {
          deleteMessage(messageId)
      }}
      onCancel={onModalClose}
      disabled={false}
    >
      <p>
        You are going to permanently delete this message and you can’t undo this action.
      </p>
    </ConfirmModal>
   )
  }
}

const mapStateToProps = (state) => {
    return state;
}

const mapDispatchToProps = {
    deleteMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(DeleteMessageConfirmWrapper, { name: "DeleteMessageConfirmWrapper"}));
