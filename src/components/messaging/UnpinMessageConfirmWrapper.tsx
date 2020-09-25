import * as Sentry from '@sentry/react';
import React from 'react';
import { connect } from 'react-redux';

import ConfirmModal from './ConfirmModal';
import { unpinMessage } from 'reducers/messages';
import { ModalKey } from 'types';

export type IProps = {
  unpinMessage?: any;
  onModalClose: any;
  messageId: number;
};

class UnpinMessageConfirmWrapper extends React.PureComponent<IProps> {
  render() {
    const { unpinMessage, onModalClose, messageId } = this.props;
    return (
      <ConfirmModal
        modalKey={ModalKey.UNPIN_MESSAGE}
        okText="Remove"
        title="Remove pinned item"
        destructive={true}
        onOk={() => unpinMessage(messageId)}
        onCancel={onModalClose}
        disabled={false}
      >
        <p>Are you sure you want to remove this pinned item?</p>
      </ConfirmModal>
    );
  }
}

const mapStateToProps = (state) => {
  return state;
};

const mapDispatchToProps = {
  unpinMessage,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sentry.withProfiler(UnpinMessageConfirmWrapper, { name: "UnpinMessageConfirmWrapper"}));
