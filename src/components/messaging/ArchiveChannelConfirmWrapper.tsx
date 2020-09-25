import * as Sentry from '@sentry/react';
import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { dispatch } from 'store';
import ConfirmModal from './ConfirmModal';
import { onArchivedChannel } from 'reducers/conversations';
import {ModalKey, TConversation} from 'types';

export type IProps = {
  /**
   * Callback invokved when the user clicks on `Close` button or `Cancel` button
   */
  onModalClose: any;

  archiveChannelId: any;

  conversations: TConversation[];
};

class ArchiveChannelConfirmWrapper extends React.PureComponent<IProps> {
  archivedChannel = () => {
    const { archiveChannelId } = this.props;
    dispatch(onArchivedChannel(archiveChannelId))
  };

  render() {
    const { conversations, onModalClose, archiveChannelId } = this.props;
    const conversation = conversations[archiveChannelId];
    const title = conversation.isArchived ? 'Unarchive channel': 'Archive channel';
    return (
      <ConfirmModal
        modalKey={ModalKey.ARCHIVE_CHANNEL}
        destructive={true}
        okText={title}
        title={title}
        onOk={this.archivedChannel}
        onCancel={onModalClose}
        disabled={false} >
        <p>
          Messages from archived channels will still show up in search and archives, the same way they do today. You can always unarchive an archived channel later, if you need it again.
          <br />
          {`Are you sure you want to ${conversation.isArchived ? 'unarchive': 'archive'} ${conversation.conversationName}?`}
        </p>
      </ConfirmModal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    conversations: get(state, 'conversations') || {},
  };
};

export default connect(
  mapStateToProps
)(Sentry.withProfiler(ArchiveChannelConfirmWrapper, { name: "ArchiveChannelConfirmWrapper"}));
