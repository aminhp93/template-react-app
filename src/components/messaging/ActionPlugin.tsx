import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { Tooltip } from 'antd';
import {
    MessageOutlined
  } from '@ant-design/icons';

import {
  TMessage,
  ConversationType,
  SecondaryView,
} from 'types';
import { read } from 'reducers/read';

import {
  pinMessage,
  unpinMessage,
} from 'reducers/messages';
import { updateSecondaryView } from 'reducers/views';
import ListReaction from './ListReaction';
import ListMessageAction from './ListMessageAction';


interface IProps {
    message: TMessage;
    authUser: any;
    pinMessage: any;
    updateSecondaryView: any;
    isPinnedItems: boolean;
    isThreadParent: boolean;
    isThreadReply: boolean;
    read: (message: TMessage, conversationType: ConversationType) => void;
    reactions: any;
    updateModal: any;
    handleClickEditMessage: any;
  }

interface IState {
    modal: any,
    isEditing:boolean,
    showMessageAction: boolean,
}

class ActionPlugin extends React.PureComponent<IProps, IState> {

    ref: any;

    state = {
        modal: null,
        isEditing: false,
        showMessageAction: false,
    };

    handleReplyClick = () => {
        const { message, updateSecondaryView } = this.props;
        updateSecondaryView(SecondaryView.THREAD_DETAIL, message.id);
    };

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside, true);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside, true);
    }

    handleClickOutside = (event) => {
        const popoverEle = document.querySelector('div.ant-popover:not(.ant-popover-hidden)')
        if (this.ref && !this.ref.contains(event.target) && popoverEle && !popoverEle.contains(event.target)) {
            this.setState({ 
                showMessageAction: false,
            });
        }
    };

    updateMessageAction = () => {
        this.setState({ showMessageAction: false }, () => {
            this.setState({ showMessageAction: false })
        })
    };

    render() {
        // console.log('ActionPlugin')
        const {
            isThreadParent,
            isThreadReply,
        } = this.props;
        const { showMessageAction } = this.state;

        return (
            <div className={`m-message-actions ${showMessageAction ? 'show' : ''}`} ref={ref => this.ref = ref}>
                <div className="m-message-actions-header-container">
                    <div className="m-message-actions-header" onClick={() => this.setState({ showMessageAction: true})}>
                        <ListReaction {...this.props} cb={this.updateMessageAction} actionPlugin />
                    </div>
                    {isThreadReply || isThreadParent ? null : (
                        <Tooltip title="Reply to thread" >
                            <div className="m-message-actions-header" onClick={this.handleReplyClick}>
                                <span><MessageOutlined className="m-medium-size"/></span>
                            </div>
                        </Tooltip>
                    )}
                    <Tooltip title="More actions" >
                        <div className="m-message-actions-header" onClick={() => this.setState({ showMessageAction: true })}>
                            <ListMessageAction {...this.props} cb={this.updateMessageAction}/>
                        </div>
                    </Tooltip>
                </div>
            </div>
        )
    }
}


const mapStateToProps = (state) => {
  return {
    authUser: get(state, 'authUser') || {},
    reactions: get(state, 'reactions') || {},
  };
};

const mapDispatchToProps = {
  pinMessage,
  unpinMessage,
  updateSecondaryView,
  read,
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(ActionPlugin, { name: "ActionPlugin"}));