import * as Sentry from '@sentry/react';
import React from 'react';
import { connect } from 'react-redux';
import { get, map, partition } from 'lodash';
import { format } from 'date-fns';
import { dispatch } from 'store';
import {
  MoreOutlined
} from '@ant-design/icons';

import {checkDMG, createDmUserIdSuccess, selectConversation} from 'reducers/conversations';
import {updatePrimaryView, updateSecondaryView} from 'reducers/views';
import { markReadThread } from 'reducers/threads';
import {TConversation, SecondaryView, PrimaryView, ConversationType} from 'types';
import { makeExcerpt } from 'utils/string';
import { mapMessagesInThreadDetail } from './utils';
import {
  updateMessageSuccess,
} from 'reducers/messages';

import LoadingIndicator from './LoadingIndicator';
import MessageItem from './MessageItem';
import MessageComposer from './MessageComposer';
import MentionOptions from './MentionOptions';

interface IProps {
  message: any;
  inHistory?: boolean;
  conversations: TConversation[];
  updateSecondaryView: any;
  messages: any;
  selectConversation: any;
  authUser: any;
  markReadThread: any;
  updateMessageSuccess: any;

  checkDMGAction: (params?: any) => Promise<any>;
}

interface IState {
  loading: boolean;
  showMoreReadReplies: boolean;
  showOption: boolean,
  pageX: any,
  pageY: any,
  user: any,
}

class ThreadListItem extends React.PureComponent<IProps, IState> {
  lastUnreadReplies: number;
  
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      showMoreReadReplies: false,
      showOption: false,
      pageX: null,
      pageY: null,
      user: null,
    };
    this.lastUnreadReplies = 0
  }

  clickUnreadRepliesCount = () => {
    try {
      const {
        message,
        messages,
        authUser,
        markReadThread,
        updateMessageSuccess
      } = this.props;
      const listMessages = mapMessagesInThreadDetail(message, messages);
      const { lastSeen } = message;
      const [unreadReplies] = partition(
        listMessages,
        (item) => item.created > lastSeen && item.creator !== authUser.id
      );
      this.lastUnreadReplies = unreadReplies.length;
      updateMessageSuccess({ id: message.id, lastSeen: format(new Date(), 'YYYY-MM-DDTHH:mm:ss.SSSSSS') })
      markReadThread(message.id)
    } catch (error) {
      // console.log(error)
    }
  };

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
    const {
      message,
      conversations,
      updateSecondaryView,
      messages,
      selectConversation,
      authUser,
    } = this.props;
    const { loading, showMoreReadReplies, showOption, pageX, pageY } = this.state;
    const conversation = conversations[message.channel];
    if (!conversation) return null;
    const isDMWithUserRemoved = conversation.conversationType === ConversationType.DirectMessage && conversation.members.filter((m) => m !== authUser.id).length == 0;
    const threadItemName = makeExcerpt((conversations[message.channel] || {}).conversationName, 10);
    const listMessages = mapMessagesInThreadDetail(message, messages);
    const { lastSeen } = message;
    const [unreadReplies, readReplies] = partition(
      listMessages,
      (item) => item.created > lastSeen && item.creator !== authUser.id
    );
    const unreadRepliesCount = unreadReplies.length;
    const sortedReadReplies = readReplies.sort((a, b) =>
      a.created.localeCompare(b.created)
    );
    const visibleReadReplies = showMoreReadReplies
      ? sortedReadReplies
      : sortedReadReplies.slice(
          readReplies.length - (3 + this.lastUnreadReplies) < 0 ? 0 : readReplies.length - (3 + this.lastUnreadReplies),
          readReplies.length
        );
    const moreReadRepliesCount = sortedReadReplies.length - 3;
    return (
      <>
        <h6 className="thread--title chat-tab-title d-flex justify-content-between border-bottom p-3 mb-0">
          <span>
            Thread
            <small onClick={() => selectConversation(conversation.id)}>
              {`(in ${threadItemName})`}
            </small>
          </span>
          <div className="message_actions">
            <div className="message_actions__header message_actions--hovered">
              <span><MoreOutlined className="m-medium-size"/></span>
            </div>
            <div className="message_actions__body message_actions--hovered">
              <div onClick={() => updateSecondaryView(SecondaryView.THREAD_DETAIL, message.id)}>
                Open in thread
              </div>
            </div>
          </div>
        </h6>
        <div className="thread--content pt-3">
          <div className="thread-content__message-topic border-bottom">
            <MessageItem message={message} isThreadParent handleOpenOptionList={this.handleOpenOptionList}/>
          </div>
          <div className="thread--content__message-list">
            <ul className="flex-grow-1 list-unstyled mb-0" id="thread-messages">
              {loading ? (
                <li className="mt-3">
                  <LoadingIndicator containerClass="d-flex mt-0 mb-3 justify-content-center w-100" />
                </li>
              ) : (
                <>
                  {moreReadRepliesCount > 0 && !showMoreReadReplies && (
                    <span
                      onClick={() =>
                        this.setState({ showMoreReadReplies: true })
                      }
                      className="thread--content__show-more py-2 px-3"
                    >
                      {`Show ${moreReadRepliesCount} more ${
                        moreReadRepliesCount === 1 ? 'reply' : 'replies'
                      } `}
                      <i className="fa fa-caret-up" />
                    </span>
                  )}
                  {map(visibleReadReplies, (msg, index) => (
                    <MessageItem key={index} message={msg} isThreadReply handleOpenOptionList={this.handleOpenOptionList}/>
                  ))}
                  {unreadRepliesCount > 0 && (
                    <span
                      onClick={this.clickUnreadRepliesCount}
                      className="thread--content__show-new-replies py-2 px-3"
                    >
                      {`${unreadRepliesCount} new ${
                        unreadRepliesCount === 1 ? 'reply' : 'replies'
                      }`}
                    </span>
                  )}
                </>
              )}
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
            {!isDMWithUserRemoved && !conversation.isArchived && (<MessageComposer conversation={conversation} message={message} isThreadDetail />)}
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  const messages = get(state, 'messages') || {};
  const conversations = get(state, 'conversations') || {};
  const selectedConversationId = get(state, 'selectedConversationId');
  return {
    messages,
    selectedConversationId,
    selectedConversation: conversations[selectedConversationId] || {},
    authUser: get(state, 'authUser') || {},
    conversations,
  };
};

const mapDispatchToProps = {
  updateSecondaryView,
  selectConversation,
  markReadThread,
  updateMessageSuccess,
  checkDMGAction: checkDMG
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(ThreadListItem, { name: "ThreadListItem"}));
