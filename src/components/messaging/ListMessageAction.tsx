import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { notification, Popover } from 'antd';
import {
MoreOutlined
} from '@ant-design/icons';


import {
    TUser,
    TMessage,
    MessageType,
    ConversationType,
    ModalKey,
    SuccessType,
    SecondaryView,
    TReaction,
} from 'types';
import { read } from 'reducers/read';

import {
  pinMessage,
  unpinMessage,
  savedMessage
} from 'reducers/messages';
import { updateSecondaryView } from 'reducers/views';


interface IProps {
    users?: TUser[],
    removeReaction?: any,
    addReaction?: any,
    message?: TMessage,
    reactions?: TReaction[],
    authUser?: TUser,
    pinMessage?: any,
    savedMessage?: any,
    updateSecondaryView?: any,
    handleClickEditMessage?: any,
    updateModal?: any,
    selectedConversation?: any,
    cb?: any,
    isThreadParent?: boolean,
}

interface IState {
    visible: boolean,
    hoverReaction: any,
}

class ListMessageAction extends React.PureComponent <IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            hoverReaction: null
        }
    }

    handleVisibleChange = visible => {
        this.setState({ visible });
        if (!visible) {
          this.props.cb && this.props.cb();
        }
    };

    handlePinMessage = async () => {
        const { message, pinMessage } = this.props;
        try {
          await pinMessage(message.id);
          notification.success({
            message: SuccessType.PIN_MESSAGE_SUCCESS,
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

    handleSavedMessage = async () => {
        const { message, savedMessage } = this.props;
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

    handleReplyClick = () => {
        const { message, updateSecondaryView } = this.props;
        updateSecondaryView(SecondaryView.THREAD_DETAIL, message.id);
    };

    render() {
         const { 
            message,
            selectedConversation,
            authUser,
            isThreadParent
        } = this.props;

        const pinTarget =
        [ConversationType.DirectMessage, ConversationType.Group].indexOf(
          selectedConversation.conversationType
        ) > -1
          ? 'conversation'
          : 'channel';
        return (
            <Popover
                placement="bottomRight"
                content={
                        <div className="m-message-actions-body">
                            {!isThreadParent && message.type === MessageType.UserMessage &&
                                message.creator === authUser.id && (
                                <span onClick={() => {
                                    this.props.handleClickEditMessage();
                                    this.props.cb && this.props.cb();
                                    this.setState({ visible: false })
                                }}>Edit</span>
                            )}
                            {!isThreadParent && message.creator === authUser.id && (
                                <span onClick={() => {
                                    this.props.updateModal(ModalKey.DELETE_MESSAGE);
                                    this.props.cb && this.props.cb();
                                    this.setState({ visible: false })
                                    
                                }}>Delete</span>
                            )}
                            {message.pinnedAt 
                                ? <span onClick={() => {
                                    this.props.updateModal(ModalKey.UNPIN_MESSAGE);
                                    this.props.cb && this.props.cb();
                                    this.setState({ visible: false })
                                }}>{`Unpin from this ${pinTarget}`}</span>
                                : <span onClick={() => {
                                    this.handlePinMessage().then(() => {
                                        this.props.cb && this.props.cb();
                                        this.setState({ visible: false })
                                    });
                                }}>{`Pin to this ${pinTarget}`}</span>
                            }
                            <span onClick={() => {
                                this.handleSavedMessage().then(() => {
                                    this.props.cb && this.props.cb();
                                    this.setState({visible: false});
                                });
                            }}>{message.isSaved ? 'Unsave message' : 'Save message'}</span>
                        </div>        
                }
                trigger="click"
                visible={this.state.visible}
                onVisibleChange={this.handleVisibleChange}
            >   
                <div className="m-reaction-button">
                    <span className="m-reaction-button-add">
                        <MoreOutlined className="m-medium-size"/>
                    </span>
                </div>
            </Popover>
        )
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
      reactions: get(state, 'reactions') || {},
    };
};

const mapDispatchToProps = {
    pinMessage,
    unpinMessage,
    savedMessage,
    updateSecondaryView,
    read,
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(ListMessageAction, { name: "ListMessageAction"}));
  
  