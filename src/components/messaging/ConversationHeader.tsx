import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dropdown, Menu } from 'antd';
import { get } from 'lodash';
import { dispatch } from 'store';

import LeaveChannelConfirmWrapper from './LeaveChannelConfirmWrapper';
import DeleteChannelConfirmWrapper from './DeleteChannelConfirmWrapper';
import {
  TConversation,
  TUser,
  SecondaryView,
  EditChannelType,
  ConversationType,
} from 'types';
import { ChannelManageMembersModal } from './ChannelManageMembersModal';
import { AddChannelMemberModal } from './AddChannelMemberModal';
import { AddGroupMemberModal } from './AddGroupMemberModal';
import { GroupManageMembersModal } from './GroupManageMembersModal';
import EditChannelTopicWrapper from './EditChannelTopicWrapper';
import EditChannelNameWrapper from './EditChannelNameWrapper';
import ArchiveChannelConfirmWrapper from './ArchiveChannelConfirmWrapper';
import FavoriteButton from './FavoriteButton';
import Search from './Search';

import { toggleFavorite, onMuteConversation, onHideConversation } from 'reducers/conversations';
import { updateSecondaryView } from 'reducers/views';

import INFORMATION_ICON_URL from '@img/information.svg';
import MUTE_ICON_URL from '@img/mute.svg';
import PROFILE_ICON_URL from '@img/profile.svg';
import EDIT_ICON_URL from '@img/edit.svg';


export function ConversationInfoButton({ onClick }) {
  return (
    <div className="flex" onClick={onClick}>
      <img src={INFORMATION_ICON_URL} alt="Conversation information" />
    </div>
  );
}

export function DirectConversationTitle({ user }) {
  if (user.isRemoved)
    return 'Insight User';

  return (
    <a
      href={`/profile/${user.id}`}
      target="_blank"
      rel="noreferrer"
      className="text-hover-underline"
    >
      {user.fullName}
    </a>
  );
}

export type TProps = {
  conversations: TConversation[];
  selectedConversationId: number;
  authUser: TUser;
  onViewDetail?: (key: string) => void;
  onToggleFavorite?: (id: number) => Promise<void>;
  // onMuteConversationAction?: (id: number) => Promise<void>;
  updateSecondaryView: any;
  secondaryView: SecondaryView;
};

export class ConversationHeader extends React.Component<TProps> {
  state = {
    modal: '',
    showActionMenu: false,
  };

  onAddTopic = () => {
    this.setState({
      modal: EditChannelType.Topic,
    });
  };

  onMenuClick = ({ key }) => {
    const { selectedConversationId } = this.props;
    switch (key) {
      case 'muteChannel':
        dispatch(onMuteConversation(selectedConversationId));
        break;
      case 'hideChannel':
        dispatch(onHideConversation(selectedConversationId));
        break;
      case 'info':
        this.setState({ modal: key });
        this.props.updateSecondaryView(SecondaryView.CONVERSATION_INFO);
        break;
      default:
        this.setState({ modal: key });
        break;
    }
  };

  onModalClose = () => this.setState({ modal: null });

  render() {
    // console.log('ConversationHeader')
    const {
      conversations,
      selectedConversationId,
      authUser,
      onToggleFavorite,
      updateSecondaryView,
      secondaryView,
    } = this.props;

    const { modal } = this.state;

    const conversation = conversations[selectedConversationId];
    if (!conversation) return null;
    const {
      conversationName,
      conversationType,
      members,
      admins,
      topic,
    } = conversation;
    const isAdmin = admins && admins.includes(authUser.id);
    const inPreviewMode = !(members || []).includes(
      authUser.id
    );

    const channelMenu = isAdmin ? (
      <Menu onClick={this.onMenuClick}>
        <Menu.Item key="info">View channel information</Menu.Item>
        <Menu.Divider />
        {conversation.isTeamDefault || conversation.isArchived? null: <Menu.Item key="add">Add members to channel</Menu.Item>}
        <Menu.Item key="manage">Manage members</Menu.Item>
        {conversation.isArchived? null: <Menu.Item key="muteChannel">{conversation.isMute ? 'Unmute channel' : 'Mute Channel'}</Menu.Item>}
        {conversation.isArchived? null: <Menu.Item key="hideChannel">{conversation.isHide ? 'Unhide channel' : 'Hide Channel'}</Menu.Item>}
        {conversation.isTeamDefault ? null : <Menu.Item key="archivedChannel">{conversation.isArchived ? 'Unarchive channel' : 'Archive channel'}</Menu.Item>}
        {conversation.isTeamDefault ? null : <Menu.Divider />}
        {conversation.isTeamDefault || conversation.isArchived? null: <Menu.Item key="leave">Leave channel</Menu.Item>}
        {conversation.isTeamDefault ? null : <Menu.Item key="delete">Delete channel</Menu.Item>}
      </Menu>
    ) : (
      <Menu onClick={this.onMenuClick}>
        <Menu.Item key="info">View channel information</Menu.Item>
        <Menu.Divider />
        {inPreviewMode || conversation.isTeamDefault || conversation.isArchived ? null : <Menu.Item key="add">Add members to channel</Menu.Item>}
        <Menu.Item key="manage">Manage members</Menu.Item>
        {conversation.isArchived? null: <Menu.Item key="muteChannel">{conversation.isMute ? 'Unmute channel' : 'Mute Channel'}</Menu.Item>}
        {conversation.isArchived? null: <Menu.Item key="hideChannel">{conversation.isHide ? 'Unhide channel' : 'Hide Channel'}</Menu.Item>}
        {inPreviewMode || conversation.isTeamDefault || conversation.isArchived ? null : <Menu.Divider />}
        {inPreviewMode || conversation.isTeamDefault || conversation.isArchived ? null : <Menu.Item key="leave">Leave channel</Menu.Item>}
      </Menu>
    );

    const dmMenu = (
      <Menu onClick={this.onMenuClick}>
        <Menu.Item key="addGroup">Add members</Menu.Item>
        <Menu.Item key="muteChannel">{conversation.isMute ? 'Unmute Conversation' : 'Mute Conversation'}</Menu.Item>
        <Menu.Item key="hideChannel">{conversation.isHide ? 'Unhide Conversation' : 'Hide Conversation'}</Menu.Item>
      </Menu>
    );

    const groupMenu = (
      <Menu onClick={this.onMenuClick}>
        <Menu.Item key="addGroup">Add members</Menu.Item>
        <Menu.Item key="manageGroup">Manage members</Menu.Item>
        <Menu.Item key="muteChannel">{conversation.isMute ? 'Unmute Conversation' : 'Mute Conversation'}</Menu.Item>
        <Menu.Item key="hideChannel">{conversation.isHide ? 'Unhide Conversation' : 'Hide Conversation'}</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="changeName">Rename group</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="leave">Leave group</Menu.Item>
      </Menu>
    );

    let menu = channelMenu;
    if ([ConversationType.Public, ConversationType.Private].includes(conversationType)) {
      menu = channelMenu;
    } else if (conversationType === ConversationType.Group) {
      menu = groupMenu;
    } else if (conversationType === ConversationType.DirectMessage) {
      menu = dmMenu;
    }

    const isDMG = [
      ConversationType.DirectMessage,
      ConversationType.Group,
    ].includes(conversationType);

    return (
      <header className="chat-tab-title border-bottom p-3 mb-0 cursor-pointer h-auto">
        <div className="conversation-title-container flex flex-row">
          <div className="flex flex-fill flex-column">
            <h1 className="conversation-name font-weight-bold small mb-0">
              {conversationName}
              {conversation.isMute && (
                  <span className="ml-2">
                    <img src={MUTE_ICON_URL} alt="Mute Conversation" />
                  </span>
              )}
            </h1>

            <div className="converstation-title-detail font-size-default flex align-items-center">
              <FavoriteButton onToggleFavorite={onToggleFavorite}/>

              <div
                className="conversation-participants"
                onClick={() => this.onMenuClick({ key: isDMG ? 'manageGroup' : 'members' })}
              >
                <img src={PROFILE_ICON_URL} alt="Participants" />
                {` ${(members || {}).length}`}
              </div>
              {
                inPreviewMode || conversation.isArchived || conversationType == ConversationType.DirectMessage
                ? null
                : (
                  <div className="conversation-topic ml-1">
                    <div onClick={this.onAddTopic} className="add-topic-button">
                        |{' '}
                        <img
                          src={EDIT_ICON_URL}
                          alt={topic ? 'Edit topic' : 'Add a topic'}
                        />
                        {topic ? topic : 'Add a topic'}
                      </div>
                  </div>
                )
              }

            </div>
          </div>

          <div className="conversaion-menu-right flex">
            <div>
              <Search />
            </div>
            <ConversationInfoButton
              onClick={() =>
                updateSecondaryView(
                  secondaryView === SecondaryView.CONVERSATION_INFO
                    ? null
                    : SecondaryView.CONVERSATION_INFO
                )
              }
            />

            <Dropdown
              overlay={menu}
              trigger={['click']}
              placement="bottomRight"
            >
              <div className="m-dropdown__ellipsis ml-2 d-flex align-items-center">
                <i className="fa fa-ellipsis-v" />
              </div>
            </Dropdown>
          </div>
        </div>

        {modal === 'leave' && (
          <LeaveChannelConfirmWrapper onModalClose={this.onModalClose} />
        )}
        {modal === 'delete' && (
          <DeleteChannelConfirmWrapper onModalClose={this.onModalClose} />
        )}
        {modal === EditChannelType.Topic && (
          <EditChannelTopicWrapper onModalClose={this.onModalClose} />
        )}
        {modal === 'add' && (
          <AddChannelMemberModal onCancel={this.onModalClose} />
        )}
        {modal === 'manage' && (
          <ChannelManageMembersModal onCancel={this.onModalClose} />
        )}
        {modal === 'members' && (
          <ChannelManageMembersModal onCancel={this.onModalClose} />
        )}
        {modal === 'changeName' && (
          <EditChannelNameWrapper onModalClose={this.onModalClose} />
        )}
        {modal === 'addGroup' && (
          <AddGroupMemberModal onCancel={this.onModalClose} />
        )}
        {modal === 'manageGroup' && (
          <GroupManageMembersModal onCancel={this.onModalClose} />
        )}
        {modal === 'archivedChannel' && (
          <ArchiveChannelConfirmWrapper onModalClose={this.onModalClose} archiveChannelId={conversation.id} />
        )}
      </header>
    );
  }
}

const mapStateToProps = (state) => {
  const conversations = get(state, 'conversations') || {};
  const selectedConversationId = get(state, 'selectedConversationId');
  const authUser = get(state, 'authUser') || {};
  const secondaryView = get(state, 'secondaryView');
  return {
    authUser,
    selectedConversationId,
    conversations,
    secondaryView,
  };
};

const mapDispatchToProps = {
  onToggleFavorite: toggleFavorite,
  // onMuteConversationAction: onMuteConversation,
  updateSecondaryView,
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(ConversationHeader, { name: "ConversationHeader"}));
