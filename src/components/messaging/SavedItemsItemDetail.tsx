import * as Sentry from '@sentry/react';
import React from 'react';
import { connect } from 'react-redux';
import { distanceInWordsToNow } from 'date-fns';
import {ModalKey, SecondaryView, SuccessType, TMessage} from 'types'
import { notification } from 'antd';
import {
  savedMessage
} from 'reducers/messages';
import {
  getAndSelectConversation
} from 'reducers/conversations';
import { fetchMessageList } from 'reducers/messages';
import { updateSecondaryView } from 'reducers/views';
import { updateScollingSuccess } from 'reducers/scrolling';
import UserMessage from "components/messaging/UserMessage";
import {makeExcerpt} from "utils/string";


interface IProps {
    message: TMessage,
    savedMessage: any,
    getAndSelectConversation: any,
    fetchMessageList: any,
    updateSecondaryView: any,
    updateScollingSuccess: any
}

interface IState {
    modal: ModalKey;
}

class SavedItemsItemDetail extends React.PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
          modal: null,
        };
    }

    unSavedMessage = async () => {
        const {
          message,
          savedMessage
        } = this.props;
        try {
          await savedMessage(message.id);
          notification.success({
            message: message.isSaved ? SuccessType.UNSAVED_MESSAGE_SUCCESS : SuccessType.SAVED_MESSAGE_SUCCESS,
            placement: 'bottomLeft',
            duration: 4,
          });
        } catch (error) {
          notification.success({
            message: error,
            placement: 'bottomLeft',
            duration: 4,
          });
        }
    };

    handleViewReply = async () => {
        const {
          message, updateSecondaryView, getAndSelectConversation
        } = this.props;
        const haveJumpToMessage = await getAndSelectConversation(message.channel, message.conversationType);
        if (haveJumpToMessage === false) return;
        await updateSecondaryView(SecondaryView.THREAD_DETAIL, message.parent);
        this.handleScrollToSavedMessage(message.id, 300)
    };

    handleViewMessage = async () => {
        const {
          message, fetchMessageList, updateScollingSuccess, getAndSelectConversation
        } = this.props;
        const haveJumpToMessage = await getAndSelectConversation(message.channel, message.conversationType);
        if (haveJumpToMessage === false) return;
        updateScollingSuccess(true);
        await fetchMessageList({ before: message.created });
        await fetchMessageList({ after: message.created });
        this.handleScrollToSavedMessage(message.id, 300)
    };

    handleScrollToSavedMessage = (message_id, timeout) => {
        setTimeout(() => {
          const savedMessageElement = document.getElementById(`${message_id}`);
          if (savedMessageElement) {
            savedMessageElement.scrollIntoView({ behavior: 'smooth' });
          }
          this.props.updateScollingSuccess(false);
          this.highlight();
        }, timeout);
    };

    highlight() {
        const { message } = this.props;
        const savedMessageElement = document.getElementById(`${message.id}`);
        if (savedMessageElement) {
          savedMessageElement.classList.add('pinned-highlight');
          setTimeout(() => savedMessageElement.classList.remove('pinned-highlight'), 3000);
        }
    }

    render() {
        const {
          message, getAndSelectConversation
        } = this.props;
        const conversationName = makeExcerpt(message.conversationName, 30);
        return (
            <>
                <h6 className="saved-items--list__item--header chat-tab-title d-flex justify-content-between border-bottom p-3 mb-0">
                    <span>
                        <small onClick={() => getAndSelectConversation(message.channel)}>
                          {`(in ${conversationName})`}
                        </small>
                    </span>
                </h6>
                <div className="saved-items--list__item--content">
                    <i className="fa fa-times ml-2 pointer close-button" onClick={this.unSavedMessage}/>
                    <UserMessage {...message} notShowPinnedIcon notShowSavedIcon itemTimestamp={distanceInWordsToNow(message.timeSaved)} />
                    <div className="mt-2 px-3 ml-5 mb-2">
                        {message.parent && (
                            <span style={{fontSize: '.8rem'}}>In thread | </span>
                        )}
                        <span
                            className="btn btn-link text-primary p-0"
                            style={{fontSize: '.8rem'}}
                            onClick={
                                message.parent ? this.handleViewReply : this.handleViewMessage
                            }
                        >
                            {`View ${message.parent ? 'reply' : 'message'}`}
                        </span>
                    </div>
                </div>
            </>
        )
    }
}

// const mapStateToProps = (state) => {
//
// };

const mapDispatchToProps = {
    savedMessage,
    getAndSelectConversation,
    fetchMessageList,
    updateSecondaryView,
    updateScollingSuccess
};

export default connect(null, mapDispatchToProps)(Sentry.withProfiler(SavedItemsItemDetail, { name: "SavedItemsItemDetail"}));