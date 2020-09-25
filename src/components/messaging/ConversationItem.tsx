import * as Sentry from '@sentry/react';
import * as React from 'react';
import clsx from 'clsx';
import { Dropdown, Menu, Badge, Tooltip } from 'antd';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { dispatch } from 'store';

import { TConversation, TUser, ConversationType } from 'types';
import { UserAvatar } from 'components/messaging/UserAvatar';
import { getDistanceInWordsToNow } from './utils';
import ArchiveChannelConfirmWrapper from 'components/messaging/ArchiveChannelConfirmWrapper';
import { onMuteConversation, onHideConversation } from 'reducers/conversations';

import LOCK_ICON_URL from '@img/lock.svg';
import NETWORK_ICON_URL from '@img/network.svg';
import MUTE_ICON_URL from '@img/mute.svg';

interface IProps {
  users: TUser[];
  authUser: any;
  onlineUsers: any;
  conversation: TConversation;
  compactDisplay: boolean;
  isActive: boolean;
  reactions: any,
  
  onClick?(e: React.MouseEvent<HTMLElement>): void;
}

interface IState {
  showMenuManagement: boolean,
  modal: string,
}

class ConversationItem extends React.PureComponent<IProps, IState> {
  
  state = {
    showMenuManagement: false,
    modal: null,
  };

  checkOnline = (onlineUsers, conversation, authUser) => {
    if (!onlineUsers || !conversation || !authUser) return false;
    let result = false;
    (onlineUsers || []).map((i) => {
      ((conversation || {}).members || []).map((j) => {
        if (j !== (authUser || {}).id && i === j) {
          result = true;
        }
      });
    });
    return result;
  };

  renderFullAvatar = () => {
    const { conversation, users, authUser, onlineUsers } = this.props;
    const { lastMemberReply, conversationType, creator } = conversation;
    let dmMember;
    if (conversation.members.length > 1) {
      dmMember = conversation.members.filter((m) => m !== authUser.id)[0];
    }
    const isOnline = this.checkOnline(onlineUsers, conversation, authUser);
    const isGroup = conversationType === ConversationType.Group;
    const secondUserAvatar = conversation.members.filter(
      (m) => m !== (lastMemberReply ? lastMemberReply : creator)
    )[0];

    // Full item has all group's avatar
    if (isGroup) {
      if (conversation.members.length === 1) {
        return (
          <div className="m-avatar-container">
            <div
              className={isOnline ? 'm-online-status' : 'm-offline-status'}
            />
            <UserAvatar user={authUser.id} />
          </div>
        );
      }

      return (
        <div className="group-avatar m-avatar-container">
          <div className={isOnline ? 'm-online-status' : 'm-offline-status'} />
          <div className="group-avatar--item">
            <UserAvatar user={users[secondUserAvatar]} />
          </div>
          <div className="group-avatar--item">
            <UserAvatar user={users[lastMemberReply ? lastMemberReply : creator]} />
          </div>
        </div>
      );
    }

    return (
      <div className="m-avatar-container">
        <div className={isOnline ? 'm-online-status' : 'm-offline-status'} />
        <UserAvatar user={users[dmMember]|| {}} />
      </div>
    );
  };

  onMouseOver = () => {
    this.setState({ showMenuManagement: true });
  };

  onMouseLeave = () => {
    this.setState({ showMenuManagement: false });
  };

  onMenuClick = ({ key, domEvent }) => {
    domEvent.stopPropagation();
    const { conversation } = this.props;
    switch (key) {
      case 'muteChannel':
        dispatch(onMuteConversation(conversation.id));
        break;
      case 'hideChannel':
        dispatch(onHideConversation(conversation.id));
        break;
      case 'archivedChannel':
        this.setState({ modal: key });
        break;
      default:
        break;
    }
  };

  renderIcon = () => {
    const {
      conversation,
      authUser,
      onlineUsers,
      compactDisplay,
    } = this.props;

    const { conversationType } = conversation;
    const isChannel = conversationType === ConversationType.Public || conversationType === ConversationType.Private;
    const isOnline = this.checkOnline(onlineUsers, conversation, authUser);

    if (isChannel) {
      return (
        <span className="icon">
              <img src={conversationType === ConversationType.Private ? LOCK_ICON_URL : NETWORK_ICON_URL} alt="conversation" />
        </span>
      )
    }
    return (
      <div className="m-conversation_item__avatar">
        {compactDisplay
          ? <div className={clsx('m-status', {
              online: isOnline,
              offline: !isOnline,
            })}/>
          : this.renderFullAvatar()}
      </div>
    )
  };

  renderIndicators = () => {
    const { conversation, authUser } = this.props;
    const { showMenuManagement, modal } = this.state;

    const { conversationType, mentionCount, isMute, isNew, isArchived, isTeamDefault, admins } = conversation;
    const isChannel = conversationType === ConversationType.Public || conversationType === ConversationType.Private;
    const isAdmin = admins && admins.includes(authUser.id);
    const text = isChannel ? 'Channel' : 'Conversation';
    let showMentionCount = isMute === false;
    if (isChannel && mentionCount > 0) {
      showMentionCount = true;
    }
    const menuManagement = (
      <Menu onClick={this.onMenuClick}>
        <Menu.Item key="muteChannel">{isMute ? `Unmute ${text}` : `Mute ${text}`}</Menu.Item>
        <Menu.Item key="hideChannel">{`Hide ${text}`}</Menu.Item>
        {isChannel && isAdmin && !isTeamDefault && !isArchived && (<Menu.Item key="archivedChannel">Archive channel</Menu.Item>)}
      </Menu>
    );
    return (
      <div className="m-conversation_item__indicators flex">
        {!showMenuManagement && isMute && (
          <div className="m-conversation_item__mute">
            <img src={MUTE_ICON_URL} alt={`Mute ${text}`} />
          </div>
        )}
        {isNew && <span className="m-tag">New</span>}
        {showMentionCount && (
          <div className="m-conversation_item__badge">
            <Badge
              count={mentionCount}
              className="channel-badge"
            />
          </div>
        )}
        {showMenuManagement && (
          <div className="m-conversation_item__menu_management">
            <Dropdown overlay={menuManagement} trigger={['click']} placement="bottomLeft">
              <div className="m-dropdown__ellipsis">
                <i className="fa fa-ellipsis-v" />
              </div>
            </Dropdown>
          </div>
        )}
        {isChannel && modal === 'archivedChannel' && (
            <ArchiveChannelConfirmWrapper onModalClose={() => this.setState({ modal: null })} archiveChannelId={conversation.id} />
        )}
      </div>
    )
  };

  render() {
    const {
      conversation,
      isActive,
      compactDisplay,
      users,
      authUser,
      reactions
    } = this.props;
    
    const { conversationType, isRead, isNew, isMute, conversationName, modified, members } = conversation;
    const isChannel = conversationType === ConversationType.Public || conversationType === ConversationType.Private;
    let userStatus
    let statusContent
    let emojiSrc
    if (conversationType === ConversationType.DirectMessage) {
      const filterUsers = members.filter(i => i !== authUser.id);
      if (filterUsers.length === 1) {
        userStatus = users[filterUsers[0]] || {};
        emojiSrc = (reactions[(userStatus.status || {}).emoji] || {}).src;
        statusContent = (userStatus.status || {}).status;
      }
    }
    
    return (
        <div
          onMouseOver={this.onMouseOver}
          onMouseLeave={this.onMouseLeave}
          onClick={e => this.props.onClick(e)}
          className={clsx(
            'm-conversation_list__item',
            { channel: isChannel },
            { message: !isChannel },
            { active: isActive },
            { unread: (!isRead || isNew) && !isMute },
            { compact: !isChannel && compactDisplay }
          )}
        >
          {this.renderIcon()}
          <div className="m-conversation_item__content flex">
            <div className="m-conversation_item__name">
              <div className="name">{conversationName}
              {emojiSrc && 
                <Tooltip placement="top" title={<><img src={emojiSrc} style={{ width: "18px", height: "18px" }}/> <span>{statusContent}</span></>}>
                {<img src={emojiSrc} style={{ width: "18px", height: "18px", marginLeft: "4px" }}/> }
                </Tooltip>
              }
              </div>
              
              {!isChannel && !compactDisplay && (
                <span className="timestamp">
                  {getDistanceInWordsToNow(modified)}
                </span>
              )}
            </div>
            {this.renderIndicators()}
          </div>        
        </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    authUser: get(state, 'authUser') || {},
    users: get(state, 'users') || {},
    onlineUsers: get(state, 'onlineUsers'),
    reactions: get(state, 'reactions') || {},
  };
};

export default connect(mapStateToProps, null)(Sentry.withProfiler(ConversationItem, { name: "ConversationItem"}));