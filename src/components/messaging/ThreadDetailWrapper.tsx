import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { get, map } from 'lodash';
import { dispatch } from 'store';

import {ConversationType, PrimaryView, TMessage} from 'types';
import { makeExcerpt } from 'utils/string';
import MessageItem from './MessageItem';
import MessageComposer from './MessageComposer';
import { checkDMG, createDmUserIdSuccess, selectConversation } from 'reducers/conversations';
import { updatePrimaryView, updateSecondaryView } from 'reducers/views';
import { mapMessagesInThreadDetail } from './utils';
import MentionOptions from './MentionOptions';

import CLOSE_ICON_URL from '@img/close.svg';


interface IProps {
  authUser?: any;
  message: TMessage;
  conversations: any;
  updateSecondaryView: any;
  messages: [TMessage];

  checkDMGAction: (params?: any) => Promise<any>;
}

interface IState {
  showOption: boolean,
  pageX: any,
  pageY: any,
  user: any,
}

class ThreadDetailWrapper extends React.PureComponent<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      showOption: false,
      pageX: null,
      pageY: null,
      user: null,
    };
  }

  openConversation = () => {};

  handleOpenOptionList = (pageX, pageY, user) => {
    this.setState((state) => ({
      showOption: !state.showOption,
      pageX,
      pageY,
      user,
    }));
  };

  viewProfile = () => {
    const { user } = this.state;
    window.open(`/profile/${user.target.id}`, '_blank');
  };

  sendMessage = async (e) => {
    const { authUser } = this.props;
    const { user } = this.state;
    try {
      // dm exist
      const dmg = await this.props.checkDMGAction([user.target.id, authUser.id]);
      dispatch(selectConversation(dmg.id));
    } catch(err) {
      dispatch(createDmUserIdSuccess(user.target.id));
      dispatch(updatePrimaryView(PrimaryView.CreateConversation));
    }
    this.setState({ showOption: false });
  };

  render() {
    const { message, updateSecondaryView, conversations, messages, authUser } = this.props;
    const threadItemName = makeExcerpt((conversations[message.channel] || {}).conversationName, 10);
    const visibleReadMessages = mapMessagesInThreadDetail(message, messages);
    const conversation = conversations[message.channel] || {};
    const inPreviewMode = !(conversation.members || []).includes(
      authUser.id
    );
    const isDMWithUserRemoved = conversation.conversationType === ConversationType.DirectMessage && conversation.members.filter((m) => m !== authUser.id).length == 0;
    const { showOption, pageX, pageY } = this.state;
    return (
      <>
        <h6 className="thread--title chat-tab-title d-flex justify-content-between border-bottom p-3 mb-0">
          <span>
            Thread
            <small onClick={this.openConversation}>
              {`(in ${threadItemName})`}
            </small>
          </span>

          <img
            src={CLOSE_ICON_URL}
            alt="close"
            className="cursor-pointer"
            onClick={() => updateSecondaryView(null)}
          />
        </h6>
        <div className="thread--content pt-3">
          <div className="thread-content__message-topic border-bottom">
            <MessageItem message={message} isThreadParent handleOpenOptionList={this.handleOpenOptionList}/>
          </div>
          <div className="thread--content__message-list">
            <ul className="flex-grow-1 list-unstyled mb-0" id="thread-messages">
              {map(visibleReadMessages, (msg: TMessage) => (
                <MessageItem key={msg.id} isThreadReply message={msg} handleOpenOptionList={this.handleOpenOptionList}/>
              ))}
            </ul>
            {showOption && this.state.user && this.state.user.target && (
              <MentionOptions
                pageX={pageX}
                pageY={pageY}
                close={this.handleOpenOptionList}
                viewProfile={this.viewProfile}
                sendMessage={this.sendMessage}
                isCurrentUser={this.state.user.target.id === authUser.id}
              />
            )}
            { !inPreviewMode && !conversation.isArchived && !isDMWithUserRemoved &&(
                <MessageComposer conversation={conversation} message={message} isThreadDetail />
            )}
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  const messages = get(state, 'messages') || {};
  const conversations = get(state, 'conversations') || {};
  const selectedThreadDetail = get(state, 'selectedThreadDetail') || {};
  return {
    messages,
    message: messages[selectedThreadDetail] || {},
    conversations,
    authUser: get(state, 'authUser') || {},
  };
};

const mapDispatchToProps = {
  updateSecondaryView,
  checkDMGAction: checkDMG
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(ThreadDetailWrapper, { name: "ThreadDetailWrapper"}));
