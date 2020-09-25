import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { debounce, get } from 'lodash';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { Avatar, Button, Modal, Select, Spin } from 'antd';

import { ConversationType, TConversation, TUser } from 'types';
import { dispatch, RootStateType } from 'store';
import {
  searchUserInConversation as searchUserInConversationAction,
  searchUserNotInConversation as searchUserNotInConversationAction,
} from 'reducers/users';

import { getUserProgramAbbr } from 'utils/userInfo';
import { addChannelMember } from 'reducers/conversations';

import { CloseModalButton } from './CloseModalButton';

const logger = new Logger(__filename);

const { Option } = Select;

interface IProps {
  conversations: TConversation[];
  users: any;
  onCancel: any;
  selectedTeamId: number;
  selectedConversationId: number;
  searchUserNotInConversation?: (params?: any) => Promise<any>;
}

interface IState {
  data: any[];
  loading: boolean;
  fetchingUsers: boolean;
  addedUsers: any[];
  channel: TConversation;
  selectedUsers: [];
}

interface IUserTagProps {
  user: TUser;
  onRemove(): void;
}

class BaseAddChannelMemberModal extends React.Component<IProps, IState> {
  lastFetchId: number;

  constructor(props) {
    super(props);

    this.lastFetchId = 0;
    this.fetchUsers = debounce(this.fetchUsers, 800);

    this.state = {
      addedUsers: [],
      channel: null,
      data: [],
      fetchingUsers: false,
      loading: false,
      selectedUsers: [],
    };
  }

  private fetchUsers = async (term) => {
    const params = {
      term,
      team: null,
      notInChannel: this.props.selectedConversationId,
    };

    const { channel } = this.state;
    if (
      [ConversationType.Public, ConversationType.Private].indexOf(
        channel.conversationType
      ) > -1
    ) {
      params.team = this.props.selectedTeamId;
    }

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

  private handleButtonClick = (e) => {
    const { users, selectedConversationId } = this.props;
    const { selectedUsers } = this.state;
    const selectedId = Object.values(selectedUsers).map((s) => s.value);

    this.setState({ loading: true });
    dispatch(addChannelMember(selectedConversationId, selectedId))
      .then((res) => {
        const userIds = res.map((r) => r.userId);
        const addedUsers = Object.values(users).filter((u: TUser) =>
          userIds.includes(u.id)
        );
        this.setState({ addedUsers, loading: false });
      })
      .catch((err) => {
        logger.error(err);
        this.setState({ loading: false });
      });
  };

  private handleChange = (values) => {
    this.setState({ selectedUsers: values });
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
      loading,
      addedUsers,
      selectedUsers,
      fetchingUsers,
    } = this.state;
    const { onCancel } = this.props;

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
              More people have joined your channel.
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
            <h5 className="mb-3 mt-3 m-manage_modal__title">
              Add members to {channel && channel.conversationName} channel
            </h5>
            <Select
              showArrow
              allowClear
              labelInValue
              size="large"
              mode="multiple"
              value={selectedUsers}
              notFoundContent={fetchingUsers ? <Spin size="small" /> : null}
              placeholder="Select or search for people to add to this channel"
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
  searchUserInConversation: searchUserInConversationAction,
  searchUserNotInConversation: searchUserNotInConversationAction,
};

export const AddChannelMemberModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseAddChannelMemberModal);
export default Sentry.withProfiler(BaseAddChannelMemberModal, { name: "BaseAddChannelMemberModal"});
