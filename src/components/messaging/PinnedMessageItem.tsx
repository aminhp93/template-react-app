import * as Sentry from '@sentry/react';
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

import { ModalKey, SecondaryView } from 'types';
import { fetchMessageList } from 'reducers/messages';
import { updateSecondaryView } from 'reducers/views';
import { updateScollingSuccess } from 'reducers/scrolling';

import MessageItem from './MessageItem';
import UnpinMessageConfirmWrapper from './UnpinMessageConfirmWrapper';


interface IProps {
  message: any;
  fetchMessageList: any;
  updateSecondaryView: any;
  updateScollingSuccess: any,
  inPreviewMode: boolean,
  isArchived: boolean,
}

interface IState {
  modal: ModalKey;
}

class PinnedMessageItem extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      modal: null,
    };
  }

  handleViewMessage = async () => {
    const { message, fetchMessageList, updateScollingSuccess } = this.props;
    updateScollingSuccess(true);
    await fetchMessageList({ before: message.created });
    await fetchMessageList({ after: message.created });

    setTimeout(() => {
      const pinnedMessageElement = document.getElementById(`${message.id}`);
      if (pinnedMessageElement) {
        pinnedMessageElement.scrollIntoView();
      }
      this.highlight();
      updateScollingSuccess(false)
    }, 0);
  };

  handleViewReply = () => {
    const { message, updateSecondaryView } = this.props;
    updateSecondaryView(SecondaryView.THREAD_DETAIL, message.parent);
    setTimeout(() => {
      const pinnedMessageElement = document.getElementById(`${message.id}`);
      if (pinnedMessageElement) {
        pinnedMessageElement.scrollIntoView({ behavior: 'smooth' });
      }
      this.highlight();
    }, 300);
  };

  highlight() {
    const { message } = this.props;

    const pinnedMessageElement = document.getElementById(`${message.id}`);
    if (pinnedMessageElement) {
      pinnedMessageElement.classList.add('pinned-highlight');
      setTimeout(() => pinnedMessageElement.classList.remove('pinned-highlight'), 3000);
    }
  }

  render() {
    const { message, inPreviewMode, isArchived } = this.props;
    const { modal } = this.state;
    return (
      <div className="pinned-container">
        <MessageItem key={message.id} message={message} isPinnedItems />
        {!inPreviewMode && !isArchived && (
            <i className="fa fa-times ml-2 pointer close-button" onClick={() => this.setState({modal: ModalKey.UNPIN_MESSAGE})} />
        )}
        <div className="mt-2 px-3 ml-5">
          {message.parent && (
            <span style={{ fontSize: '.7rem' }}>In thread | </span>
          )}
          <button
            className="btn btn-link text-primary p-0"
            onClick={
              message.parent ? this.handleViewReply : this.handleViewMessage
            }
          >
            {`View ${message.parent ? 'reply' : 'message'}`}
          </button>
        </div>
        {modal === ModalKey.UNPIN_MESSAGE && (
          <UnpinMessageConfirmWrapper
            messageId={message.id}
            onModalClose={() => this.setState({ modal: null })}
          />
        )}
      </div>
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
    users: get(state, 'users') || {},
    messages: get(state, 'messages') || {},
  };
};

const mapDispatchToProps = {
  fetchMessageList,
  updateSecondaryView,
  updateScollingSuccess
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(PinnedMessageItem, { name: "PinnedMessageItem"}));
