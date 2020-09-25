import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

import { ConversationType, TConversation, TUser } from 'types';
import PreviewChannel from './PreviewChannel';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';

interface IProps {
  authUser: TUser;
  selectedConversation: TConversation;
}

class MessagingWrapper extends React.PureComponent<IProps> {

  renderChatBoxIfNeeded = () => {
    const { selectedConversation, authUser } = this.props;
    const inPreviewMode = !(selectedConversation.members || []).includes(authUser.id);
    if (inPreviewMode || selectedConversation.isArchived) {
      return <PreviewChannel/>
    }
    // Check dm with removed user
    if (selectedConversation.conversationType === ConversationType.DirectMessage && selectedConversation.members.filter((m) => m !== authUser.id).length == 0) {
      return (
        <div className="preview-channel m-3 p-4 text-center">
          <div className="preview-channel__title">
            You can’t send message to<span className="preview-channel__channel-name ml-1">{selectedConversation.conversationName}</span> because they have been deactivated or removed from the Platform
          </div>
        </div>
      );
    }
    return <MessageComposer isEditing={false} conversation={selectedConversation} />;
  };

  render() {
    // console.log('MessagingWrapper')
    return (
      <div className="messaging-wrapper conversation--body body position-relative d-flex flex-column justify-content-end d-flex flex-grow-1">
        <MessageList />
        {this.renderChatBoxIfNeeded()}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const authUser = get(state, 'authUser') || {};
  const conversations = get(state, 'conversations') || {};
  const selectedConversationId = get(state, 'selectedConversationId');
  const selectedConversation = conversations[selectedConversationId] || {};
  return {
    authUser,
    selectedConversation,
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(MessagingWrapper, { name: "MessagingWrapper"}));
