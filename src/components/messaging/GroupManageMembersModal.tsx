import * as Sentry from '@sentry/react';
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { debounce, get, unionBy } from 'lodash';
import { connect } from 'react-redux';
import { Avatar, Dropdown, Input, List, Menu, Modal } from 'antd';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroller';

import { TConversation, TUser } from 'types';
import { RootStateType } from 'store';
import { searchUserInConversation as searchUserInConversationAction } from 'reducers/users';
import { removeGroupMember as removeGroupMemberAction } from 'reducers/conversations';
import { getUserProgramAbbr } from 'utils/userInfo';

import { CloseModalButton } from './CloseModalButton';
import { ConfirmDialog } from './ConfirmDialog';

const logger = new Logger(__filename);

interface IGroupManageMemberModalProps {
  authUser?: any;

  /**
   * Reference to conversation store
   */
  conversations?: TConversation[];

  removeGroupMember: (channelId: number, userId: number) => Promise<any>;
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

interface IGroupManageMemberModalState {
  /**
   * The action that could be applied to each members managed in this modal
   */
  action: 'removeMember' | null;

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
function MemberList(props) {
  const { members, adminIds, authUser, onAction } = props;

  return (
    <List
      dataSource={members}
      renderItem={(member: TUser, index: number) => (
        <MemberItem
          key={member.id}
          member={member}
          isMyself={authUser.id === member.id}
          // isAdmin={adminIds && adminIds.includes(member.id)}
          isMemberAdmin={adminIds.includes(member.id)}
          isLastItem={index === members.length - 1}
          // showMenu={adminIds && adminIds.includes(authUser.id)}
          isAdmin={adminIds.includes(authUser.id)}
          onClick={(e) => {
            onAction(e.key, member.id);
          }}
        />
      )}
    />
  );
}
function MemberItem(props) {
  const { member, isMyself, isMemberAdmin, isLastItem, onClick, isAdmin } = props;

  // isMyself: member as authUser
  // isAdmin: member as admin -> isMemberAdmin
  // showMenu: authUser as admin -> isAdmin
  const menu = (
    <Menu onClick={onClick}>
      <Menu.Item key="removeMember">Remove</Menu.Item>
    </Menu>
  );

  const placement = isLastItem ? 'topRight' : 'bottomRight';
  const adminLabelCls = clsx({ 'admin-label': isMemberAdmin }, { myself: isMyself });

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
      {isMemberAdmin && <div className={adminLabelCls}>Group Admin</div>}
      {isAdmin && !isMyself && (
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
  IGroupManageMemberModalProps,
  IGroupManageMemberModalState
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
    const { action, actionTarget, users } = this.state;
    const { selectedConversationId } = this.props;
    if (!actionTarget) return;

    switch (action) {
      case 'removeMember':
        await this.props.removeGroupMember(
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
        break;
    }
    this.setState({ action: null, actionTarget: null, loading: false });

    const { conversations } = this.props;
    const channel = conversations[selectedConversationId];
    this.setState({ channel });
  };

  public componentDidMount = () => {
    const { conversations, selectedConversationId } = this.props;
    const channel = conversations[selectedConversationId];
    this.setState({ channel });

    this.fetchUsers();
  };

  public render(): JSX.Element {
    const { authUser, onCancel } = this.props;
    const { action, channel, loading, page, users } = this.state;

    const isAdmin =
      channel && channel.admins && channel.admins.includes(authUser.id);

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
          {channel && channel.members.length < 2 ? 'member' : 'members'} in this
          group
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
      </Modal>
    );
  }
}

const mapStateToProps = (state: RootStateType) => {
  const authUser = get(state, 'authUser') || {};
  const conversations = get(state, 'conversations') || [];
  const selectedConversationId = get(state, 'selectedConversationId');

  return { authUser, conversations, selectedConversationId };
};

const mapDispatchToProps = {
  removeGroupMember: removeGroupMemberAction,
  searchUserInConversation: searchUserInConversationAction,
};

export const GroupManageMembersModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(ManageModal);
export default Sentry.withProfiler(ManageModal, { name: "ManageModal"});
