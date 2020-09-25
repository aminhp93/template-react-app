import * as Sentry from '@sentry/react';
import React from 'react';
import { get, keyBy, cloneDeep } from 'lodash';
import { connect } from 'react-redux';
import { Tooltip, notification } from 'antd';
import { default as NetworkSerivce, NetworkStatus } from 'services/Network';

import { TReaction, TMessage, TConversation } from 'types';
import {
    removeReaction,
    addReaction
  } from 'reducers/messages';
import ListReaction from './ListReaction';
import ListUserReaction from './ListUserReaction';


interface IProps {
    users: any,
    removeReaction: any,
    addReaction: any,
    conversation: TConversation,
    message?: TMessage,
    reactions: TReaction[],
    authUser: any,
    inPreviewMode: boolean
}

interface IState {
    network: NetworkStatus
}

class Reaction extends React.PureComponent <IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            network: NetworkStatus.ONLINE
        }
        // this.clickReaction = debounce(this.clickReaction, 1000)
    }

    componentDidMount() {
        NetworkSerivce.addListener(this.onNetworkStatusChanged);
    }

    onNetworkStatusChanged = (status) => {
        this.setState({
            network: status
        })
    };

    map = (listReactions, reactions) => {
        if (!reactions) return [];
        const cloneReaction = cloneDeep(reactions);
        return cloneReaction.map(i => {
            i.src = (listReactions[i.name] || {}).src;
            i.displayName = (listReactions[i.name] || {}).displayName;
            return i
        })
    };

    clickReaction = async reaction => {
        const { conversation, message, authUser, inPreviewMode } = this.props;
        if (conversation.isArchived || inPreviewMode) return;
        const { reactions } = message;
        const reactionsObj = keyBy(reactions, 'name');
        const { name } = reaction;
        if (this.state.network === NetworkStatus.OFFLINE) return;
        try {
            if (reactionsObj[name] && reactionsObj[name].users.includes(authUser.id)) {
                await this.props.removeReaction({ messageId: message.id, name })
            } else {
                await this.props.addReaction({ messageId: message.id, name })
            }
        } catch (e) {
            notification.error({
                message: 'Error!',
                placement: 'bottomLeft',
                duration: 5,
            });
        }
    };

    render() {
        // console.log('Reactions')
        const { 
            users, message, authUser, inPreviewMode, conversation,
            reactions: listReactions
         } = this.props;
        const { reactions } = message;
        if (!reactions || reactions.length === 0) return null;
        const mapReaction = this.map(listReactions, reactions);
        return (
            <div className="m-reaction">
                <div className="m-reaction-container">
                    {mapReaction.map((i, r_index) => {
                        let toolTipText = '';
                        const firstTwoUsers = i.users.slice(0, 2);
                        if (i.users.length > 2) {
                            firstTwoUsers.map((user, index) => {
                                const fullName = user === authUser.id ? 'You (click to remove)' : (users[user] || {}).fullName;
                                if (index === 0) {
                                    toolTipText += `${fullName}`
                                } else {
                                    toolTipText += `, ${fullName}`
                                }
                            });
                            toolTipText += ` and ${i.users.length - 2} other${i.users.length > 3 ? 's' : ''} reacted to this message`
                        } else {
                            i.users.map((user, index) => {
                                const fullName = user === authUser.id ? 'You (click to remove)' : (users[user] || {}).fullName;
                                if (index === 0) {
                                    toolTipText += `${fullName}`
                                } else {
                                    toolTipText += `, ${fullName}`
                                }
                            });
                            toolTipText += ` reacted with ${i.displayName}`
                        }
                        const userReacted = i.users.includes(authUser.id);
                        if (i.users.length === 0) return null;
                        return (
                            <Tooltip title={toolTipText} key={r_index}>
                                <button className={`m-reaction-button ${userReacted ? 'reacted' : ''}`} onClick={() => this.clickReaction(i)} key={r_index}>
                                    <img src={i.src}  alt={i.name}/>
                                    <span className="m-reaction-count">{i.users.length}</span>
                                </button>
                            </Tooltip>
                        )
                    })}
                    <button><ListUserReaction message={message}/></button>
                    {!inPreviewMode && !conversation.isArchived && (<button><ListReaction {...this.props}/></button>)}
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const authUser = get(state, 'authUser') || {};
    const conversations = get(state, 'conversations');
    const selectedConversationId = get(state, 'selectedConversationId');
    const conversation = conversations[selectedConversationId] || {};
    const inPreviewMode = !((conversation || {}).members || []).includes(authUser.id);
    return {
        authUser,
        users: get(state, 'users') || {},
        reactions: get(state, 'reactions') || {},
        conversation,
        inPreviewMode
    };
};

const mapDispatchToProps = {
    addReaction,
    removeReaction
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(Reaction, { name: "Reaction"}))
  