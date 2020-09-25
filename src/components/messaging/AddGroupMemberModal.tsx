import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { debounce, get, unionBy } from 'lodash';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { Alert, Avatar, Button, Modal, Select, Spin } from 'antd';

import { ConversationType, TConversation, TUser } from 'types';
import { RootStateType } from 'store';
import {
  searchUserInConversation as searchUserInConversationAction,
  searchUserNotInConversation as searchUserNotInConversationAction,
} from 'reducers/users';

import {
  addGroupMember as addGroupMemberAction,
  getOrCreateDMG as getOrCreateDMGAction,
  selectConversation as selectConversationAction,
} from 'reducers/conversations';
import { getUserProgramAbbr } from 'utils/userInfo';

import { CloseModalButton } from './CloseModalButton';

const logger = new Logger(__filename);

const { Option } = Select;

interface IProps {
  /**
   * Current authenticated user
   */
  authUser: TUser;

  /**
   * Callback to add users to a group
   */
  addGroupMember: (channelId: number, userId: number[]) => Promise<any>;

  /**
   * Reference to list of conversations in store
   */
  conversations: TConversation[];

  /**
   * Callback to get or create a new DMG by its members
   */
  getOrCreateDMG: (params?: any) => Promise<any>;

  /**
   * Reference to list of users in store
   */
  users: any;

  /**
   * Callback invoked when user click on the X button of the dialog
   */
  onCancel: any;

  /**
   * Callback to select a conversation (i.e., set selectedConversationId in the store)
   */
  selectConversation: (id: number) => Promise<any>;

  /**
   * Reference to currently selected conversation id in the store
   */
  selectedConversationId: number;

  /**
   * Callback to search for users who are not in current conversation
   */
  searchUserNotInConversation?: (params?: any) => Promise<any>;
}

interface IState {
  /**
   * User data as the data source of the select
   */
  data: any[];

  /**
   *
   */
  error: null;

  /**
   * Whether we're waiting for any async (API, etc.) results
   */
  loading: boolean;

  /**
   * Whether we're waiting for waiting fetching users from API
   */
  fetchingUsers: boolean;

  /**
   * List of users who have just added to the group
   */
  addedUsers: any[];

  /**
   *
   */
  channel: TConversation;

  /**
   * List of currently selected users from the select
   */
  selectedUsers: any[];
}

interface IUserTagProps {
  user: TUser;
  onRemove(): void;
}

class AddMemberModal extends React.Component<IProps, IState> {
  lastFetchId: number;

  constructor(props) {
    super(props);

    this.lastFetchId = 0;
    this.fetchUsers = debounce(this.fetchUsers, 400);

    this.state = {
      addedUsers: [],
      channel: null,
      data: [],
      error: null,
      fetchingUsers: false,
      loading: false,
      selectedUsers: [],
    };
  }

  private fetchUsers = async (term) => {
    const params = {
      term,
      notInChannel: this.props.selectedConversationId,
    };

    const { channel } = this.state;

    try {
      this.lastFetchId += 1;
      const fetchId = this.lastFetchId;
      this.setState({ data: [], fetchingUsers: true });

      if (fetchId !== this.lastFetchId) return;

      const response = await this.props.searchUserNotInConversation(params);
      const users = get(response, 'users') || [];
      this.setState({ data: Object.values(users), fetchingUsers: false });
    } catch (error) {
      this.setState({ fetchingUsers: false });
      logger.error(error);
    }
  };

  private handleButtonClick = async () => {
    const { users, selectedConversationId } = this.props;
    const { channel, selectedUsers } = this.state;
    const selectedIds = Object.values(selectedUsers).map((s) => s.value);

    if (channel.conversationType === ConversationType.DirectMessage) {
      const oneOneTarget = this.getCurrentOneOneUser();
      selectedIds.push(oneOneTarget.id);

      this.setState({ loading: true });

      try {
        const response = await this.props.getOrCreateDMG(selectedIds);
        const { conversation, created } = response;

        if (created) {
          await this.props.addGroupMember(conversation.id, selectedIds);
        }

        this.props.selectConversation(conversation.id);
        this.props.onCancel();
      } catch (error) {
        this.setState({ error: error.message });
      } finally {
        this.setState({ loading: false });
      }
    } else {
      this.setState({ loading: true, error: null });
      try {
        const data = await this.props.addGroupMember(channel.id, selectedIds);
        const userIds = data.map((d) => d.userId);
        const addedUsers = userIds.map((id) => users[id]);
        this.setState({ addedUsers });
      } catch (error) {
        this.setState({ error: error.message });
      } finally {
        this.setState({ loading: false });
      }
    }
  };

  private handleChange = (values) => {
    this.setState({ selectedUsers: values });
  };

  private getCurrentOneOneUser = (): TUser | null => {
    // Get current target user in a one-one conversation
    let user = null;
    const { channel } = this.state;
    const { authUser, users } = this.props;
    const oneOneTargetId = channel.members.filter((u) => u !== authUser.id);
    if (oneOneTargetId && oneOneTargetId.length === 1) {
      user = users[oneOneTargetId[0]];
    }

    return user;
  };

  public componentDidMount() {
    const { conversations, selectedConversationId, users } = this.props;
    const conversation = conversations[selectedConversationId];
    this.setState({ channel: conversation });

    this.fetchUsers(null);
  }

  render(): JSX.Element {
    const {
      data,
      channel,
      error,
      loading,
      addedUsers,
      selectedUsers,
      fetchingUsers,
    } = this.state;
    const { authUser, users, onCancel } = this.props;

    let targetUserName = '';
    if (
      channel &&
      channel.conversationType === ConversationType.DirectMessage
    ) {
      targetUserName = get(this.getCurrentOneOneUser(), 'fullName');
    }
    return (
      <Modal
        visible
        closable
        destroyOnClose
        width={910}
        title={null}
        footer={null}
        closeIcon={<CloseModalButton />}
        onCancel={onCancel}
        className="m-modal m-manage_modal m-add_members_modal"
        style={{ minHeight: 560 }}
        centered
      >
        {addedUsers && addedUsers.length > 0 ? (
          <>
            <h5 className="mb-3 mt-3 m-manage_modal__title">
              Congratulations!
            </h5>
            <p className="m-manage_modal__subtitle">
              More people have joined your group.
            </p>
            <ul className="m-member-tags-list">
              {addedUsers.map((user) => (
                <li key={user.id} className="m-member-tag">
                  <Avatar
                    size="small"
                    src={user.profileImage}
                    alt=""
                    style={{ marginRight: 15 }}
                  />
                  <span className="m-member-name">{user.fullName}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <h5 className="mb-3 mt-3 m-manage_modal__title">Add members</h5>
            {channel && channel.conversationType === 'G' && (
              <p>Add more members to this group</p>
            )}
            {channel && channel.conversationType === 'D' && (
              <p>
                When you add new members to your current direct message with{' '}
                <strong>{targetUserName}</strong>, a new group conversation will
                be created.
              </p>
            )}
            <Select
              showArrow
              allowClear
              labelInValue
              size="large"
              mode="multiple"
              value={selectedUsers}
              notFoundContent={fetchingUsers ? <Spin size="small" /> : null}
              placeholder="Select or search for people to add"
              filterOption={false}
              style={{ width: '100%' }}
              onChange={this.handleChange}
              onSearch={this.fetchUsers}
            >
              {data.map((d: TUser) => (
                <Option key={d.id} value={d.id}>
                  <div className="multi-value-option-group">
                    <img
                      src={d.profileImage}
                      alt=""
                      className="rounded-circle"
                    />
                    <span className="value-option">{` ${d.fullName}`}</span>
                    {d && d.sessionShortName && (
                      <span
                        className={`session-tag ${getUserProgramAbbr(
                          d
                        )}-accent`}
                        style={{ marginLeft: 10 }}
                      >
                        {d.sessionShortName}
                      </span>
                    )}
                  </div>
                </Option>
              ))}
            </Select>
            <div className="text-right mt-2">
              <Button
                size="large"
                type="primary"
                className="ml-auto"
                disabled={selectedUsers.length === 0}
                style={{ width: 102 }}
                onClick={this.handleButtonClick}
                loading={loading}
              >
                Add
              </Button>
            </div>
            {error && (
              <div className="mt-2 flex flex-fill">
                <Alert type="error" showIcon message={error} />
              </div>
            )}
          </>
        )}
      </Modal>
    );
  }
}

const mapStateToProps = ({
  users,
  authUser,
  conversations,
  selectedConversationId,
  selectedTeamId,
}: RootStateType) => ({
  users,
  authUser,
  conversations,
  selectedConversationId,
  selectedTeamId,
});

const mapDispatchToProps = {
  addGroupMember: addGroupMemberAction,
  getOrCreateDMG: getOrCreateDMGAction,
  searchUserInConversation: searchUserInConversationAction,
  searchUserNotInConversation: searchUserNotInConversationAction,
  selectConversation: selectConversationAction,
};

export const AddGroupMemberModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(AddMemberModal);
export default Sentry.withProfiler(AddMemberModal, { name: "AddMemberModal"});
