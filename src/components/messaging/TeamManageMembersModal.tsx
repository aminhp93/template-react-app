import * as Sentry from '@sentry/react';
import * as React from 'react';
import clsx from 'clsx';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { debounce, get, unionBy } from 'lodash';
import { connect } from 'react-redux';
import { Avatar, Dropdown, Input, List, Menu, Modal } from 'antd';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroller';

import { TTeam, TUser } from 'types';
import { searchUserInTeam } from 'reducers/users';
import {
  makeTeamAdmin,
  removeTeamMember,
  removeTeamAdmin,
} from 'reducers/teams';

import { getUserProgramAbbr } from 'utils/userInfo';
import { CloseModalButton } from './CloseModalButton';
import { ConfirmDialog } from './ConfirmDialog';

const logger = new Logger(__filename);

interface ITeamManageMemberModalProps {
  authUser?: any;

  /**
   * Reference to conversation store
   */
  teams?: TTeam[];

  makeTeamAdmin: (teamId: number, userId: number) => Promise<any>;

  removeTeamAdmin: (teamId: number, userId: number) => Promise<any>;

  removeTeamMember: (teamId: number, userId: number) => Promise<any>;
  /**
   * Callback invoked when this modal is closed
   */
  onCancel?: any;

  /**
   * Callback to search for users in team by term
   */
  searchUserInTeam?: (params?: any) => Promise<any>;

  /**
   * Reference to selected team id in store
   */
  selectedTeamId?: number;
}

interface ITeamManageMemberModalState {
  /**
   * The action that could be applied to each members managed in this modal
   */
  action: 'makeAdmin' | 'removeAdmin' | 'removeMember' | null;

  /**
   * The ID of the user which is the target of an action
   */
  actionTarget: number | null;

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
      Are you sure you want to remove this person as admin of this team?
    </ConfirmDialog>
  );
}
function MakeAdminConfirm(props: IConfirmProps) {
  return (
    <ConfirmDialog
      title="Assign Team Admin"
      okText="Make Admin"
      onOk={props.onOk}
      onCancel={props.onCancel}
      loading={props.loading}
    >
      Once added, an admin can manage this team. Do you want to proceed?
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
          // isAdmin={adminIds.includes(member.id)}
          isMemberAdmin={adminIds.includes(member.id)}
          isLastItem={index === members.length - 1}
          // showMenu={adminIds.includes(authUser.id)}
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
      {isMemberAdmin ? (
        <Menu.Item key="removeAdmin">Remove Admin</Menu.Item>
      ) : (
        <Menu.Item key="makeAdmin">Make Admin</Menu.Item>
      )}
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
      {isMemberAdmin && <div className={adminLabelCls}>Team Admin</div>}
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
  ITeamManageMemberModalProps,
  ITeamManageMemberModalState
> {
  lastFetchId: number;

  state = {
    action: null,
    actionTarget: null,
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
      team: this.props.selectedTeamId,
      page: this.state.page,
    };

    try {
      this.lastFetchId += 1;
      const fetchId = this.lastFetchId;

      const response = await this.props.searchUserInTeam(params);
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
    const { selectedTeamId } = this.props;

    if (!actionTarget) return;

    switch (action) {
      case 'makeAdmin':
        await this.props.makeTeamAdmin(selectedTeamId, actionTarget);
        break;
      case 'removeAdmin':
        await this.props.removeTeamAdmin(selectedTeamId, actionTarget);
        break;
      case 'removeMember':
        await this.props.removeTeamMember(selectedTeamId, actionTarget);
        if (users.length > 0) {
          const newUsers = users.filter((u) => u.id !== actionTarget);
          this.setState({ users: newUsers });
        }
        break;
      default:
        throw Error('Unsupported action');
    }
    this.setState({ action: null, actionTarget: null, loading: false });
  };

  public componentDidMount = () => {
    this.fetchUsers();
  };

  public render(): JSX.Element {
    const { authUser, onCancel, teams, selectedTeamId } = this.props;
    const { action, loading, page, users } = this.state;
    const team = teams[selectedTeamId];
    const isAdmin = team && team.admins.includes(authUser.id);

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
          {team && team.members.length}{' '}
          {team && team.members.length < 2 ? 'member' : 'members'} in{' '}
          {team && team.displayName} team
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
              adminIds={team && team.admins}
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
  const selectedTeamId = get(state, 'selectedTeamId');
  const teams = get(state, 'teams');

  return { authUser, selectedTeamId, teams };
};

const mapDispatchToProps = {
  makeTeamAdmin,
  removeTeamAdmin,
  removeTeamMember,
  searchUserInTeam,
};

export const TeamManageMembersModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(ManageModal);
export default Sentry.withProfiler(ManageModal, { name: "ManageModal"});
