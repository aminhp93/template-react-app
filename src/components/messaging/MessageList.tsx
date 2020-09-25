import * as Sentry from '@sentry/react';
import * as React from 'react';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { connect } from 'react-redux';
import { get, debounce } from 'lodash';
import { Button } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';

import { PrimaryView } from 'types';
import MessageItem from './MessageItem';
import MentionOptions from './MentionOptions';

import { fetchMessageList, getMessagesAround } from 'reducers/messages';
import {
  selectConversation,
  createDmUserIdSuccess,
  checkDMG,
} from 'reducers/conversations';
import { updatePrimaryView } from 'reducers/views';
import { removeShowLatestMessagesSuccess } from 'reducers/showLatestMessages';
import { updateLoadingSuccess } from 'reducers/loading';
import { updateNewUnreadMessagesSuccess, resetNewUnreadMessagesuccess } from 'reducers/newUnreadMesssages';
import { updateConversationSuccess } from 'reducers/conversations';

import { mapMessageList } from './utils';
import LoadingContainer from './LoadingContainer';

const logger = new Logger('MessageList');


export type TScrollContainerProps = {
  /**
   * Unique ID identify the children, required to persist/restore scroll
   * position between unmount/remount.
   */
  id: string | number,

  /**
   * Buffer margin to consider the scroll is at the bottom.
   * Default is 50, since exact 0 is a bit too tight.
   */
  margin: number,

  /**
   * The children whose scroll position is managed
   */
  children: React.ReactElement
}

/**
 * Component providing scroll position behavior as follow:
 * - If user is at the bottom of the scrollable container, it will keep scrolled
 *   to the bottom despite any changes.
 * - If it is scrolled to a different position (either by user/manually), it
 *   will keep that position desipte any changes, include unmount/remount.
 *
 * To be able to do that, this component hooks into the various life-cycle
 * methods of React as follow:
 *
 * - componentDidMount: first render, scroll to bottom | last stored position
 * - getSnapshotBeforeUpdate: this replaces the now deprecated
 *   {@code componentWillUpdate}. The React docs does specifically state that
 *   one of the use-case for this is to handle chat scroll position
 *   position is actually at the bottom, a.k.a pinned
 * - componentDidUpdate: once it has been updated, scroll to the bottom, or
 *   restore the scroll position according to the
 *   {@link ScrollPositionManager#pinning} status
 * - componentWillUnmount: store the current scroll position, as well as pinning
 *   status
 *
 * Potential use-case for this are {@link MessageList} and {@link
 * PinnedMessageList}, in that new message won't change the scroll position of
 * the message list (users are viewing some past messages)
 *
 * {@see https://reactjs.org/docs/react-component.html#getsnapshotbeforeupdate}
 */
export class ScrollContainer extends React.Component<TScrollContainerProps> {
  static defaultProps = {
    margin: 50
  };

  static _store: {
    [id: string]: {
      pinning: boolean
      scrollTop: number
      scrollHeight: number
    }
  } = {};

  childrenRef = React.createRef<HTMLElement>();

  componentDidMount() {
    const node = this.childrenRef.current;

    if (ScrollContainer._store[this.props.id]) {
      // Re-render, position exists in store
      const { pinning, scrollTop } = ScrollContainer._store[this.props.id];
      node.scrollTop = pinning ? node.scrollHeight : scrollTop
    } else {
      // First time render, no stored position
      ScrollContainer._store[this.props.id] = {
        pinning: true,
        scrollTop: node.scrollHeight,
        scrollHeight: node.scrollHeight
      };
      node.scrollTop = node.scrollHeight
    }
  }

  getSnapshotBeforeUpdate() {
    const node = this.childrenRef.current;
    const { scrollHeight, clientHeight, scrollTop } = node;
    if (!ScrollContainer._store[this.props.id]) {
      ScrollContainer._store[this.props.id] = {
        pinning: true, scrollTop: 0, scrollHeight: 0
      }
    }
    ScrollContainer._store[this.props.id].pinning = clientHeight + scrollTop + this.props.margin >= scrollHeight;
    ScrollContainer._store[this.props.id].scrollTop = scrollTop;
    ScrollContainer._store[this.props.id].scrollHeight = scrollHeight;
    return null
  }

  componentDidUpdate() {
    const node = this.childrenRef.current;
    const { pinning, scrollTop, scrollHeight } = ScrollContainer._store[this.props.id] || {};
    if (pinning) {
      node.scrollTop = node.scrollHeight
    } else {
      node.scrollTop = scrollTop + (node.scrollHeight - scrollHeight)
    }
  }

  componentWillUnmount() {
    const node = this.childrenRef.current;
    const { scrollHeight, clientHeight, scrollTop } = node;

    ScrollContainer._store[this.props.id] = {
      pinning: clientHeight + scrollTop + this.props.margin >= scrollHeight,
      scrollTop: node.scrollTop,
      scrollHeight: node.scrollHeight
    }
  }

  render() {
    return React.cloneElement(this.props.children, {
      ref: this.childrenRef
    })
  }
}

interface IProps {
  openThreadDetail?: any,
  messages: any,
  selectedConversationId: number,
  selectedConversation: any,
  fetchMessageList: any,
  authUser: any,
  scrolling: any,
  newUnreadMesssages: number,
  disableAroundAPI: boolean,

  checkDMGAction: (params?: any) => Promise<any>,
  removeShowLatestMessagesSuccess: any,
  showLatestMessages: any,
  getMessagesAround: any,
  selectConversation: any,
  createDmUserIdSuccess: any,
  updatePrimaryView: any,
  updateLoadingSuccess: any,
  updateNewUnreadMessagesSuccess: any,
  resetNewUnreadMessagesuccess: any,
  updateConversationSuccess: any,
}

interface IState {
  showOption: boolean,
  pageX: number,
  pageY: number,
  user: any,
  showBackToRecentButton: boolean,
  showNewUnreadMesssages: boolean,
}

export class MessageList extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.onScroll = debounce(this.onScroll, 1000)
  }

  state = {
    showOption: false,
    pageX: null,
    pageY: null,
    user: null,
    showBackToRecentButton: false,
    showNewUnreadMesssages: false,
  };

  loadingAfter = false;
  hasNoMore = false;
  fetchedIds = [];
  nextUrl = null;
  next = false;
  disableScroll = false;
  oldScrollTop = null;
  updateScrollTop = false;

  addHighlightUnread = async () => {
    try {
      
      const { selectedConversation, selectedConversationId } = this.props;
      this.next = true;
      this.hasNoMore = false;
      this.disableScroll = true;
      const { seen } = selectedConversation;
      let id;
      
      const res = await this.props.fetchMessageList({ seen });
      const sorted = res.data.results.filter(i => i.created > seen).sort((a, b) => a.created.localeCompare(b.created));
      if (sorted && sorted.length > 0) {
        this.updateScrollTop = false;
        id = sorted[0].id;
        this.props.updateConversationSuccess({ id: selectedConversationId, newMessageId: id })
      } else {
        this.updateScrollTop = true;
        const messageDOMList = document.getElementById('main-chat-container');
        if (messageDOMList && this.props.selectedConversation.scrollTop) {
          messageDOMList.scrollTop = this.props.selectedConversation.scrollTop;
        }
      }
      const after = (res.data.results.sort((a, b) => b.created.localeCompare(a.created))[0] || {}).created
      while (this.next) {
        const res = await this.props.fetchMessageList({ after }, this.nextUrl);
             
        if (res.data && res.data.next) {
          this.next = true;
          this.nextUrl = res.data.next
        } else {
          this.next = false;
          const dom = id && document.getElementById(id);
          if (this.updateScrollTop) {
            // 
          } else {
            dom && dom.previousSibling && dom.previousSibling.scrollIntoView()
          }
        }
      }
      
      if (!selectedConversation.isRead) {
        
        const xxx = this.props.selectedConversation.newMessageId;
        if (xxx) {
          const dom = document.getElementById(xxx)
          if (dom && dom.previousSibling) {
            const unreadLineContainerDOM = document.querySelector('.m-unread-line-container');
            const unreadLineDOM = document.querySelector('.m-message-item.m-unread-line');
            
            unreadLineContainerDOM && unreadLineContainerDOM.remove();
            unreadLineDOM && unreadLineDOM.classList.remove('m-unread-line');
  
            dom.classList.add('m-unread-line');
            const unreadLineContainer = document.createElement('div');
            const lineBefore = document.createElement('div');
            const lineAfter = document.createElement('div');
            const textContainer = document.createElement('div');
            const text = document.createElement('div');
  
            text.innerText = 'new messages';
            lineBefore.classList.add('m-line');
            text.classList.add('m-text');
            textContainer.classList.add('m-text-container');
            lineAfter.classList.add('m-line-after');
            unreadLineContainer.classList.add('m-unread-line-container');
  
            textContainer.appendChild(text);
            textContainer.appendChild(lineAfter);
            unreadLineContainer.appendChild(lineBefore);
            unreadLineContainer.appendChild(textContainer);
            dom.appendChild(unreadLineContainer)
          }
        }
      }
    } catch (e) {
      logger.error(e)
    }
  }

  componentDidMount() {
    this.addHighlightUnread()
  }

  componentWillUpdate() {
    const messageDOMList = document.getElementById('main-chat-container');
    if (messageDOMList) {
      this.oldScrollTop = messageDOMList.scrollTop
    }
  }

  async componentDidUpdate(prev: IProps) {
    const { messages, selectedConversationId, authUser } = this.props;
    const { messages: oldMessages, selectedConversationId: oldSelectedConversationId } = prev;
    if (this.props.selectedConversationId && this.props.selectedConversationId !== prev.selectedConversationId) {
      this.addHighlightUnread()
    } else {
      const newList = mapMessageList(messages, selectedConversationId);
      const oldList = mapMessageList(oldMessages, oldSelectedConversationId)
      if (oldList.length && newList.length && oldList[oldList.length - 1].created < newList[newList.length - 1].created) {
        // has new message
        const lastMessageDOM = this.getLastMessage();
        const bounding = lastMessageDOM && lastMessageDOM.getBoundingClientRect();
        // Last message not in view
        if (bounding && !this.checkInView(bounding)) {
          const messageDOMList = document.getElementById('main-chat-container');
          if (messageDOMList) {
            messageDOMList.scrollTop = this.oldScrollTop;
          }

          // last message not in view and message is not from current user
          if ((newList[newList.length - 1] || {}).creator && (newList[newList.length - 1] || {}).creator !== authUser.id) {
            this.props.updateNewUnreadMessagesSuccess()
            this.props.updateConversationSuccess({ id: selectedConversationId, isRead: false })
          }

          if (this.props.newUnreadMesssages === 0 && (newList[newList.length - 1] || {}).creator && (newList[newList.length - 1] || {}).creator !== authUser.id) {
            const unreadLineContainerDOM = document.querySelector('.m-unread-line-container');
            const unreadLineDOM = document.querySelector('.m-message-item.m-unread-line');
            
            unreadLineContainerDOM && unreadLineContainerDOM.remove();
            unreadLineDOM && unreadLineDOM.classList.remove('m-unread-line');

            lastMessageDOM.classList.add('m-unread-line');
            const unreadLineContainer = document.createElement('div');
            const lineBefore = document.createElement('div');
            const lineAfter = document.createElement('div');
            const textContainer = document.createElement('div');
            const text = document.createElement('div')

            text.innerText = 'new messages';
            lineBefore.classList.add('m-line');
            text.classList.add('m-text');
            textContainer.classList.add('m-text-container');
            lineAfter.classList.add('m-line-after');
            unreadLineContainer.classList.add('m-unread-line-container');

            textContainer.appendChild(text);
            textContainer.appendChild(lineAfter);
            unreadLineContainer.appendChild(lineBefore);
            unreadLineContainer.appendChild(textContainer);
            lastMessageDOM.appendChild(unreadLineContainer)         
          }
        }
      }
    }
  }

  // TODO: use tether/antd dropdown instead
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
    const { authUser, checkDMGAction, selectConversation, createDmUserIdSuccess, updatePrimaryView } = this.props;
    const { user } = this.state;
    try {
      // dm exist
      const dmg = await checkDMGAction([user.target.id, authUser.id]);
      selectConversation(dmg.id)
    } catch(err) {
      createDmUserIdSuccess(user.target.id);
      updatePrimaryView(PrimaryView.CreateConversation)
    }
    this.setState({ 
      showOption: false,
    });
  };

  checkInView = (bounding, top=0, bottom=0) => {
    return (
      bounding.height > 0 && 
      bounding.top >= top &&
      bounding.left >= 0 &&
      bounding.bottom + bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  onScroll = async (e) => {
    if (!this.next && this.disableScroll) {
      this.disableScroll = false;
      return;
    }
  
    const { scrolling, getMessagesAround, disableAroundAPI } = this.props;
    if (this.loadingAfter || scrolling || this.next) return;

    let id;
    const xxx = document.querySelectorAll('#main-chat-container li');
    for (let i=0; i < xxx.length; i++) {
      const bounding = xxx[i].getBoundingClientRect();
      if (bounding && this.checkInView(bounding, 100)) {
        id = xxx[i].getAttribute('id');
        break; 
      }
    } 
    const message = document.getElementById(id)
    const bounding = message && message.getBoundingClientRect();
    if (!this.checkLastMessageInView() && !disableAroundAPI) {
      if (bounding && this.checkInView(bounding) && !this.fetchedIds.includes(id)) {
        try {
          this.fetchedIds.push(id);
          this.loadingAfter = true;
          this.props.updateLoadingSuccess(true);
          await getMessagesAround(id);
          this.props.updateLoadingSuccess(false);
          this.loadingAfter = false
        } catch (error) {
          this.props.updateLoadingSuccess(false);
          this.loadingAfter = false
        }
      }
    }
    this.checkShowBackToRecentButton();
    this.checkNewUnreadMesssage()
  }

  backToRecent = () => {
    const { selectedConversationId, removeShowLatestMessagesSuccess } = this.props;
    const lastMessageDOM = this.getLastMessage();
    if (lastMessageDOM) {
      lastMessageDOM.scrollIntoView();
      removeShowLatestMessagesSuccess(selectedConversationId)
    }
  };

  checkShowBackToRecentButton = () => {
    const { selectedConversationId, showLatestMessages, removeShowLatestMessagesSuccess } = this.props;
    const lastMessageDOM = this.getLastMessage();
    const bounding = lastMessageDOM && lastMessageDOM.getBoundingClientRect();
    let showBackToRecentButton = false;
    if (showLatestMessages.includes(selectedConversationId) && bounding) {
      if (this.checkInView(bounding)) {
        removeShowLatestMessagesSuccess(selectedConversationId)
      } else {
        showBackToRecentButton = true
      }
    }
    this.setState({ showBackToRecentButton })  
  };

  checkNewUnreadMesssage = () => {
    const { newUnreadMesssages, resetNewUnreadMessagesuccess, selectedConversationId } = this.props;
    if (newUnreadMesssages > 0) {
      const lastMessageDOM = this.getLastMessage()
      const bounding = lastMessageDOM && lastMessageDOM.getBoundingClientRect();
      if (bounding && this.checkInView(bounding)) {
        resetNewUnreadMessagesuccess()
        // this.props.updateConversationSuccess({ id: selectedConversationId, isRead: false })
      }
    }
  };

  getLastMessage = () => {
    const { messages, selectedConversationId } = this.props;
    const lastMessage = Object.values(messages)
      .filter(i => i.channel === selectedConversationId && !i.parent)
      .sort((a, b) => b.created.localeCompare(a.created));
    return document.getElementById(`${(lastMessage[0] || {}).id}`);
  };

  checkLastMessageInView = () => {
    const lastMessageDOM = this.getLastMessage()
    const bounding = lastMessageDOM && lastMessageDOM.getBoundingClientRect()
    return bounding && this.checkInView(bounding, 0, 100);
  };

  shouldComponentUpdate(nextProps, nextState) {
    const { messages, selectedConversationId, newUnreadMesssages, selectedConversation } = this.props;
    const { messages: nextMessages, selectedConversationId: nextSelectedConversationId, newUnreadMesssages: nextNewUnreadMesssages, selectedConversation: nextSelectedConversation } = nextProps;
    return !(JSON.stringify(mapMessageList(messages, selectedConversationId)) === JSON.stringify(mapMessageList(nextMessages, nextSelectedConversationId))
        && nextNewUnreadMesssages === newUnreadMesssages
        && JSON.stringify(this.state) === JSON.stringify(nextState)
        && JSON.stringify(selectedConversation) === JSON.stringify(nextSelectedConversation));

  }

  goToNewUnreadMessages = () => {
    const unreadLineContainerDOM = document.querySelector('.m-message-item.m-unread-line');
    unreadLineContainerDOM && unreadLineContainerDOM.previousSibling && unreadLineContainerDOM.previousSibling.scrollIntoView()
  };

  render() {
    // console.log('MessageList')
    const { messages, selectedConversationId, authUser, newUnreadMesssages } = this.props;
    const { showOption, pageX, pageY, showBackToRecentButton, user } = this.state;
    const messageList = mapMessageList(messages, selectedConversationId);

    return (
      <>
      { newUnreadMesssages > 0 && <div className="m-new-unread-messages" onClick={this.goToNewUnreadMessages}>{newUnreadMesssages} new {newUnreadMesssages > 1 ? 'messages' : 'message'}</div>}
      <ScrollContainer id={selectedConversationId}>
        <ul id="main-chat-container" className="chat-message flex-grow-1 list-unstyled my-0 py-0 chat-message--full-page" onScroll={this.onScroll}>
          <LoadingContainer/>
          {messageList.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              handleOpenOptionList={this.handleOpenOptionList}
            />
          ))}
          {showOption && user && user.target && (
            <MentionOptions
              pageX={pageX}
              pageY={pageY}
              close={this.handleOpenOptionList}
              viewProfile={this.viewProfile}
              sendMessage={this.sendMessage}
              isCurrentUser={user.target.id === authUser.id}
            />
          )}
            
        </ul>
      </ScrollContainer>
      {showBackToRecentButton ? <div className="m-back-to-recent"><Button onClick={this.backToRecent}>Back to recent <CaretDownOutlined /></Button></div> : null}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  const conversations = get(state, 'conversations') || {};
  const selectedConversationId = get(state, 'selectedConversationId');
  return {
    selectedConversationId,
    selectedConversation: conversations[selectedConversationId] || {},
    authUser: get(state, 'authUser') || {},
    messages: get(state, 'messages') || {},
    scrolling: get(state, 'scrolling'),
    showLatestMessages: get(state, 'showLatestMessages'),
    newUnreadMesssages: get(state, 'newUnreadMesssages'),
    disableAroundAPI: get(state, 'disableAroundAPI'),
  };
};

const mapDispatchToProps = {
  fetchMessageList,
  checkDMGAction: checkDMG,
  removeShowLatestMessagesSuccess,
  getMessagesAround,
  selectConversation,
  createDmUserIdSuccess,
  updatePrimaryView,
  updateLoadingSuccess,
  updateNewUnreadMessagesSuccess,
  resetNewUnreadMessagesuccess,
  updateConversationSuccess
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(MessageList, { name: "MessageList"}));
