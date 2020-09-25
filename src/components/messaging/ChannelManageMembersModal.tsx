import * as Sentry from '@sentry/react';
import React from 'react';
import clsx from 'clsx';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { debounce, get, unionBy } from 'lodash';
import { connect } from 'react-redux';
import { Avatar, Dropdown, Input, List, Menu, Modal } from 'antd';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroller';

import { TConversation, TUser } from 'types';
import { searchUserInConversation as searchUserInConversationAction } from 'reducers/users';
import {
  makeChannelAdmin,
  removeChannelAdmin,
  removeChannelMember,
} from 'reducers/conversations';
import { getUserProgramAbbr } from 'utils/userInfo';

import { CloseModalButton } from './CloseModalButton';
import { ConfirmDialog } from './ConfirmDialog';

const logger = new Logger(__filename);

interface IChannelManageMemberModalProps {
  authUser?: any;

  /**
   * Reference to conversation store
   */
  conversations?: TConversation[];

  makeChannelAdmin: (channelId: number, userId: number) => Promise<any>;

  removeChannelAdmin: (channelId: number, userId: number) => Promise<any>;

  removeChannelMember: (channelId: number, userId: number) => Promise<any>;
  /**
   * Callback invoked when this modal is closed
   */
  onCancel?: any;

  /**
   * Callback to search for users in conversation by term
   */
  searchUserInConversation?: (params?: any) => Promise<any>;

  /**
   * Reference to selected conversation id in store
   */
  selectedConversationId?: number;
}

interface IChannelManageMemberModalState {
  /**
   * The action that could be applied to each members managed in this modal
   */
  action: 'makeAdmin' | 'removeAdmin' | 'removeMember' | null;

  /**
   * The ID of the user which is the target of an action
   */
  actionTarget: number | null;

  /**
   * The channel associated with this modal
   */
  channel: TConversation | null;

  loading: boolean;

  /**
   * The next user page to fetch
   */
  page?: number | null;

  /**
   * Current search term
   */
  term: string | null;

  /**
   * List of members (users) currrently managed by this modal
   */
  users: TUser[];
}

interface IMemberListProps {
  /**
   * List of the id of admins of the channel associated with the list
   */
  adminIds: number[];

  /**
   * Currently authenticated user
   */
  authUser?: any;

  /**
   * List of users
   */
  members: TUser[];

  onAction?: (action, id) => void;

  isArchived?: boolean;

  isTeamDefault?: boolean;
}

interface IConfirmProps {
  onOk?: any;
  onCancel?: any;
  loading?: boolean;
}

function RemoveMemberConfirm(props: IConfirmProps) {
  return (
    <ConfirmDialog
      title="Remove Member"
      okText="Remove"
      onOk={props.onOk}
      onCancel={props.onCancel}
      loading={props.loading}
      destructive
    >
      Are you sure you want to remove this user?
    </ConfirmDialog>
  );
}
function RemoveAdminConfirm(props: IConfirmProps) {
  return (
    <ConfirmDialog
      title="Remove Admin"
      okText="Remove Admin"
      onOk={props.onOk}
      onCancel={props.onCancel}
      loading={props.loading}
      destructive
    >
      Are you sure you want to remove this person as admin of this channel?
    </ConfirmDialog>
  );
}
function MakeAdminConfirm(props: IConfirmProps) {
  return (
    <ConfirmDialog
      title="Assign Channel Admin"
      okText="Make Admin"
      onOk={props.onOk}
      onCancel={props.onCancel}
      loading={props.loading}
    >
      Once added, an admin can manage this channel. Do you want to proceed?
    </ConfirmDialog>
  );
}
function MemberList(props) {
  const { members, adminIds, authUser, onAction, isArchived, isTeamDefault } = props;

  return (
    <List
      dataSource={members}
      renderItem={(member: TUser, index: number) => (
        <MemberItem
          key={member.id}
          member={member}
          isMyself={authUser.id === member.id}
          // isAdmin={adminIds.includes(member.id)}
          isMemberAdmin={adminIds.includes(member.id)}
          isLastItem={index === members.length - 1}
          // showMenu={adminIds.includes(authUser.id)}
          isAdmin={adminIds.includes(authUser.id)}
          isArchived={isArchived}
          isTeamDefault={isTeamDefault}
          onClick={(e) => {
            onAction(e.key, member.id);
          }}
        />
      )}
    />
  );
}
function MemberItem(props) {
  const { member, isMyself, isAdmin, isLastItem, onClick, isMemberAdmin, isArchived, isTeamDefault } = props;

  // isMyself: member as authUser
  // isAdmin: member as admin -> isMemberAdmin
  // showMenu: authUser as admin -> isAdmin
  const showOptionRemove = !isMyself && !(isMemberAdmin && !isAdmin) && !isTeamDefault && !isArchived;

  const showOptionRemoveAdmin = !isMyself && isAdmin && isMemberAdmin && !isArchived;
  const showOptionMakeAdmin = !isMyself && isAdmin && !isMemberAdmin && !isArchived;
  const showDropDown = showOptionRemove || showOptionRemoveAdmin || showOptionMakeAdmin;

  const menu = (
    <Menu onClick={onClick}>
      {showOptionRemoveAdmin && (
          <Menu.Item key="removeAdmin">Remove Admin</Menu.Item>
      )}
      {showOptionMakeAdmin && (
          <Menu.Item key="makeAdmin">Make Admin</Menu.Item>
      )}
      {showOptionRemove && (
        <Menu.Item key="removeMember">Remove</Menu.Item>
      )}
    </Menu>
  );

  const placement = isLastItem ? 'topRight' : 'bottomRight';
  const adminLabelCls = clsx({ 'admin-label': isMemberAdmin }, { myself: isMyself && isAdmin });

  const userItem = (
    <span className="m-manage_modal__item_name">
      <span className="name">
        {isMyself ? `${member.fullName} (You)` : member.fullName}
      </span>
      {!isMyself && member.sessionShortName && (
        <span className={`session-tag ${getUserProgramAbbr(member)}-accent`}>
          {member.sessionShortName}
        </span>
      )}
    </span>
  );

  return (
    <List.Item className="m-manage_modal__item">
      <List.Item.Meta
        avatar={<Avatar src={member.profileImage} />}
        title={userItem}
        className="m-manage_modal__item_meta"
      />
      {isMemberAdmin && <div className={adminLabelCls}>Channel Admin</div>}
      {showDropDown && (
        <Dropdown overlay={menu} trigger={['click']} placement={placement}>
          <div className="m-dropdown__ellipsis">
            <i className="fa fa-ellipsis-v" />
          </div>
        </Dropdown>
      )}
    </List.Item>
  );
}

class ManageModal extends React.Component<
  IChannelManageMemberModalProps,
  IChannelManageMemberModalState
> {
  lastFetchId: number;

  state = {
    action: null,
    actionTarget: null,
    channel: null,
    loading: false,
    page: null,
    term: null,
    users: [],
  };

  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.fetchUsers = debounce(this.fetchUsers, 400);
  }

  private fetchUsers = async () => {
    this.setState({ loading: true });
    const params = {
      term: this.state.term,
      channel: this.props.selectedConversationId,
      page: this.state.page,
    };

    try {
      this.lastFetchId += 1;
      const fetchId = this.lastFetchId;

      const response = await this.props.searchUserInConversation(params);
      if (fetchId !== this.lastFetchId) return;

      const { users, nextPage } = response;

      if (this.state.page) {
        const newUsers = unionBy(this.state.users, Object.values(users), 'id');
        this.setState({ users: newUsers });
      } else {
        this.setState({ users });
      }

      this.setState({ page: nextPage, loading: false });
    } catch (error) {
      this.setState({ loading: false, page: null });
      logger.error(error);
    }
  };

  private handleAction = (action, id) => {
    this.setState({ action, actionTarget: id });
  };
  private handleInputChange = (term) => {
    this.setState({ term, users: [], page: null }, () => this.fetchUsers());
  };

  private handleLoadMore = () => {
    this.fetchUsers();
  };

  private performAction = async () => {
    this.setState({ loading: true });
    const { users, action, actionTarget } = this.state;
    const { selectedConversationId } = this.props;

    if (!actionTarget) return;

    switch (action) {
      case 'makeAdmin':
        await this.props.makeChannelAdmin(selectedConversationId, actionTarget);
        break;
      case 'removeAdmin':
        await this.props.removeChannelAdmin(
          selectedConversationId,
          actionTarget
        );
        break;
      case 'removeMember':
        await this.props.removeChannelMember(
          selectedConversationId,
          actionTarget
        );
        if (users.length > 0) {
          const newUsers = users.filter((u) => u.id !== actionTarget);
          this.setState({ users: newUsers });
        }
        break;
      default:
        throw Error('Unsupported action');
    }
    this.setState({ action: null, actionTarget: null, loading: false });

    const { conversations } = this.props;
    const channel = conversations[selectedConversationId];
    this.setState({ channel });
  };

  public componentDidMount = () => {
    const { conversations, selectedConversationId } = this.props;
    const channel = conversations[selectedConversationId];

    if (!channel) return;
    this.setState({ channel });

    this.fetchUsers();
  };

  public render(): JSX.Element {
    const { authUser, onCancel } = this.props;
    const { action, channel, loading, page, users } = this.state;

    const isAdmin = channel && channel.admins.includes(authUser.id);

    return (
      <Modal
        visible
        closable
        centered
        title={null}
        footer={null}
        width={910}
        destroyOnClose
        closeIcon={<CloseModalButton />}
        onCancel={onCancel}
        className="m-modal m-manage_modal"
      >
        <h5 className="mb-3 mt-3 m-manage_modal__title">
          {isAdmin ? 'Manage members' : 'Members'}
        </h5>
        <p>
          {channel && channel.members.length}{' '}
          {channel && channel.members.length < 2 ? 'member' : 'members'} in{' '}
          {channel && channel.conversationName} channel
        </p>
        <Input
          size="large"
          autoComplete=""
          placeholder="Search"
          id="memberSearchInput"
          onChange={(e) => this.handleInputChange(e.currentTarget.value)}
          suffix={loading ? <LoadingOutlined /> : <SearchOutlined />}
        />

        <div className="m-manage_modal__list">
          <InfiniteScroll
            initialLoad={false}
            loadMore={this.handleLoadMore}
            hasMore={!loading && page !== null}
            useWindow={false}
          >
            <MemberList
              adminIds={channel && channel.admins}
              isArchived={channel && channel.isArchived}
              isTeamDefault={channel && channel.isTeamDefault}
              authUser={authUser}
              members={users}
              onAction={this.handleAction}
            />
          </InfiniteScroll>
        </div>

        {action === 'removeMember' && (
          <RemoveMemberConfirm
            loading={loading}
            onOk={this.performAction}
            onCancel={() => this.setState({ action: null, actionTarget: null })}
          />
        )}
        {action === 'removeAdmin' && (
          <RemoveAdminConfirm
            loading={loading}
            onOk={this.performAction}
            onCancel={() => this.setState({ action: null, actionTarget: null })}
          />
        )}
        {action === 'makeAdmin' && (
          <MakeAdminConfirm
            loading={loading}
            onOk={this.performAction}
            onCancel={() => this.setState({ action: null, actionTarget: null })}
          />
        )}
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  const authUser = get(state, 'authUser') || {};
  const conversations = get(state, 'conversations') || [];
  const selectedConversationId = get(state, 'selectedConversationId');

  return { authUser, conversations, selectedConversationId };
};

const mapDispatchToProps = {
  makeChannelAdmin,
  removeChannelAdmin,
  removeChannelMember,
  searchUserInConversation: searchUserInConversationAction,
};

export const ChannelManageMembersModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(ManageModal);
export default Sentry.withProfiler(ManageModal, { name: "ManageModal"});
