import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import InViewMonitor from 'react-inview-monitor';
import { get } from 'lodash';

import UserMessage from './UserMessage';
import DeleteMessageConfirmWrapper from './DeleteMessageConfirmWrapper';
import UnpinMessageConfirmWrapper from './UnpinMessageConfirmWrapper';
import ThreadSummary from './ThreadSummary';
import Reaction from './Reaction';
import ActionPlugin from './ActionPlugin';

import {
  pinMessage,
  unpinMessage,
  updateMessageSuccess
} from 'reducers/messages';
import { updateSecondaryView } from 'reducers/views';
import { fetchTeamNotifications } from "reducers/teamNotifications";
import { getChannelsNotifications, getDMGsNotifications } from "reducers/conversations";
import { fetchThreadNotificationForTeam } from "reducers/threadNotifications";
import { fetchUserNotification } from "reducers/userNotifications";
import { read } from 'reducers/read';
import {
  TMessage,
  TConversation,
  MessageType,
  ConversationType,
  ModalKey,
} from 'types';

interface IProps {
  selectedConversation: TConversation;
  message?: TMessage;
  authUser: any;
  pinMessage?: any;
  updateSecondaryView: any;
  isPinnedItems?: boolean;
  isThreadParent?: boolean;
  isThreadReply?: boolean;
  read?: (message: TMessage, conversationType: ConversationType) => void;

  updateMessageSuccess: (message: TMessage) => void;
  fetchTeamNotifications: () => void;
  getChannelsNotifications: (params?: any) => void;
  getDMGsNotifications: (params?: any) => void;
  fetchThreadNotificationForTeam: (team?: number) => void;
  fetchUserNotification: () => void;
  handleOpenOptionList?: any;
}

class MessageItem extends React.Component<IProps> {
  ref: any;

  state = {
    modal: null,
    isEditing: false,
  };

  handleClickEditMessage = () => this.setState({ isEditing: true });

  handleFinishEdit = () => this.setState({ isEditing: false });

  onInView = () => {
    const { message, selectedConversation, authUser } = this.props;
    // return if in preview mode
    if (
      !(selectedConversation.members || []).includes(authUser.id) ||
      message.isTemporary
    ) {
      return;
    }
    // Passing in the whole message on-purpose, since we have different API calls
    // depending on whether the message is in a channel, in a thread or in a dmg.
    // The {@code read} action creator will take care of calling the correct API.
    // The view layer (this component), should have no knowledge about all that.
    if (message.channel === selectedConversation.id) {
      this.props.read(message, selectedConversation.conversationType);
    }
    // TODO: Start GIF
  };

  shouldComponentUpdate(nextProps, nextState) {
    const { message } = this.props;
    const { message: nextMessage } = nextProps;
    if (JSON.stringify(message) === JSON.stringify(nextMessage)
    && JSON.stringify(nextState) === JSON.stringify(this.state)) {
      return false
    }
    return true
  }

  onNotInView = () => {
    // TODO: Stop GIF
    const { message, selectedConversation } = this.props;
    if (message.isNew && message.channel === selectedConversation.id) {
      this.props.fetchTeamNotifications();
      if ([ConversationType.Group, ConversationType.DirectMessage].includes(selectedConversation.conversationType)) {
        this.props.getDMGsNotifications({ channel: selectedConversation.id });
      } else {
        this.props.getChannelsNotifications({ channel: selectedConversation.id });
      }
      this.props.fetchThreadNotificationForTeam(selectedConversation.team);
      this.props.fetchUserNotification();
      // remove is new msg
      this.props.updateMessageSuccess({...message, isNew: false})
    }
  };

  updateModal = (modal) => {
    this.setState({ modal })
  };

  render() {
    // console.log('MessageItem')
    const {
      message,
      selectedConversation,
      isPinnedItems,
      isThreadParent,
      isThreadReply,
      authUser,
      ...rest
    } = this.props;
    const { modal, isEditing } = this.state;

    const actionPlugin = <ActionPlugin 
      {...this.props}
      handleClickEditMessage={this.handleClickEditMessage}
      updateModal={this.updateModal}
    />;

    const plugins =
        (isPinnedItems || message.type === MessageType.SystemMessage) ? null : { actionPlugin };

    return (
      <UserMessage
        {...message}
        {...rest}
        {...plugins}
        isEditing={isEditing}
        onFinishEdit={this.handleFinishEdit}
      >
        <Reaction message={message} />
        {!isThreadParent &&
          !isThreadReply &&
          message.replyCount > 0 && (
            <ThreadSummary
              threadId={message.id}
              replyCount={message.replyCount}
              repliedUsers={message.lastMembers}
              lastReplyCreated={message.lastReplyCreated}
            />
          )}

        {modal === ModalKey.UNPIN_MESSAGE && (
          <UnpinMessageConfirmWrapper
            messageId={message.id}
            onModalClose={() => this.setState({ modal: null })}
          />
        )}

        {modal === ModalKey.DELETE_MESSAGE && (
          <DeleteMessageConfirmWrapper
            messageId={message.id}
            onModalClose={() => this.setState({ modal: null })}
          />
        )}

        <InViewMonitor
          onInView={this.onInView}
          onNotInView={this.onNotInView}
          repeatOnInView={true}
          intoViewMargin={'0px'}
        />
      </UserMessage>
    );
  }
}

const mapStateToProps = (state) => {
  const conversations = get(state, 'conversations') || {};
  const selectedConversationId = get(state, 'selectedConversationId');
  return {
    selectedConversation: conversations[selectedConversationId] || {},
    authUser: get(state, 'authUser') || {},
    messages: get(state, 'messages') || {},
  };
};

const mapDispatchToProps = {
  pinMessage,
  unpinMessage,
  updateSecondaryView,
  read,
  updateMessageSuccess,
  fetchTeamNotifications,
  getChannelsNotifications,
  getDMGsNotifications,
  fetchThreadNotificationForTeam,
  fetchUserNotification
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(MessageItem, { name: "MessageItem"}));
