import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { Button, Input, Select, Spin } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import { debounce, get } from 'lodash'
import { ConsoleLogger as Logger } from '@aws-amplify/core'

import { MessageType, TConversation, TUser, TMessage } from 'types'
import { fetchUsersList } from 'reducers/users'
import {
  checkDMG,
  createDMG,
  createDmUserIdSuccess,
  selectConversation,
} from 'reducers/conversations'

import {
  createMessage,
} from 'reducers/messages'

const logger = new Logger(__filename);
const { Option } = Select;

interface ICreateConversationProps {
  /**
   * Callback to check if a DMG conversation is existed by its members' ids
   */
  checkDMG: (params?: any) => Promise<any>;

  /**
   * Callback to create a new DMG
   */
  createDMG: (params?: any) => Promise<any>;

  /**
   * Callback to create a new message
   */
  createMessage: (params?: any) => Promise<any>;

  /**
   * Callback to 'search' for users by term
   */
  fetchUsersList: (params?: any) => Promise<any>;

  /**
   *
   */
  selectConversation: (id: number) => Promise<any>;

  /**
   * List of users currently in store
   */
  users?: TUser[];

  /**
   *  Check if send message dm
   */

  dmUserId: (id: number) => Promise<any>;
  createDmUserIdSuccess: any;
}

interface ICreateConversationState {
  conversation?: TConversation;
  /**
   * The temporary name of the DMG conversation to be created. When creating a new DMG,
   * the client would first checks with the API if there is already a DMG with those
   * targeted users. If not, it temporarily generates a conversation name based on the names
   * of those users before the actual conversation is created on the backend side.
   */
  conversationName: string;

  /**
   * The user data which is used to render the dropdown list
   */
  data: TUser[];

  /**
   * Whether we're waiting for the API to create/get DMG
   */
  loading: boolean;

  message: string;

  /**
   * List of currently selected users in the dropdown
   */
  selectedUsers: any[];

  /**
   * Whether we're waiting for fetching users from API action is completed
   */
  fetchingUsers: boolean;
}

class CreateConversation extends React.Component<ICreateConversationProps, ICreateConversationState> {
  lastFetchId: number;

  constructor(props) {
    super(props);
    const { dmUserId, createDmUserIdSuccess } = this.props;
    let selectedUsers = [];
    let conversationName = '';
    if (dmUserId) {
      selectedUsers = [{
        key: dmUserId,
        value: dmUserId
      }];
      conversationName = this.getTemporaryConversationName(selectedUsers);
      createDmUserIdSuccess(null)
    }
    this.lastFetchId = 0;
    this.fetchUser = debounce(this.fetchUser, 400);
    this.state = {
      conversation: null,
      conversationName,
      data: [],
      fetchingUsers: false,
      loading: false,
      message: '',
      selectedUsers
    }
  }

  private createDMG = async () => {
    this.setState({ loading: true });
    const { selectedUsers } = this.state;
    if (selectedUsers.length === 0) {
      throw Error('To create a new DMG, members mest be presented')
    }
    const members = selectedUsers.map(s => s.value);

    const dmg = await this.props.createDMG(members);
    this.setState({ conversation: dmg })
  };

  private createMessage = async () => {
    // TODO: replace with real features from message
    const data: TMessage = {
      channel: this.state.conversation.id,
      content: this.state.message,
      type: MessageType.UserMessage,
    };

    await this.props.createMessage(data);
    this.setState({ message: '', loading: false })
  };

  private fetchUser = async (term) => {
    try {
      const { fetchUsersList } = this.props;

      this.lastFetchId += 1;
      const fetchId = this.lastFetchId;
      this.setState({ data: [], fetchingUsers: true });
      const requestData = { term };
      const response = await fetchUsersList(requestData);
      if (fetchId !== this.lastFetchId) return;

      const data = response.data.results;
      this.setState({ data, fetchingUsers: false })
    } catch(error) {
      this.setState({ fetchingUsers: false })
    }
  };

  /**
   * Generates conversation name based on member's name
   */
  private getTemporaryConversationName = (selectedUsers) => {
    let name = '';
    if (selectedUsers.length === 0) {
      return name;
    }

    const selectedIds = selectedUsers.map(s => s.value);
    const { users } = this.props;

    if (selectedUsers.length === 1) {
      // Direct message, name is the target user's name
      const user = users[selectedIds[0]];
      name = get(user, 'fullName') || ''
    } else {
      const members = Object.values(users).filter(u => selectedIds.includes(u.id));
      const names = members.map(u => u.fullName);

      if (names && names.length === 2) {
        name = `${names[0]}, ${names[1]}`
      } else if (names && names.length === 3) {
        name = `${names[0]}, ${names[1]} and another person`
      } else {
        name = `${names[0]}, ${names[1]} and ${names.length - 2} other people`
      }
    }
    return name
  };

  private handleCreateClick = async () => {
    this.setState({ loading: true });
    const { selectedUsers } = this.state;
    const { checkDMG, createDMG, selectConversation } = this.props;
    const members = Object.values(selectedUsers).map(s =>  s.value);

    try {
      const dmg = await checkDMG(members);
      this.setState({ loading: false });
      selectConversation(dmg.id)
    } catch(err) {
      logger.info('No DMG with those members existed');
      this.setState({ conversationName: this.getTemporaryConversationName(selectedUsers) });
      this.setState({ loading: false })
    }

  };

  private handleChange = (values) => {
    this.setState({ selectedUsers: values })
  };

  private handleMessageInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.currentTarget;
    this.setState({ message: value })
  };

  private handleSendButtonClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      const dmg = await this.createDMG();
      const message = await this.createMessage();

      const { conversation } = this.state;
      if (conversation) {
        this.props.selectConversation(conversation.id)
      }
    } catch(error) {
      logger.error(error)
    }
  };

  public componentDidMount = () => {
    this.fetchUser(null)
  };

  public render(): JSX.Element {
    const { loading, message, selectedUsers, fetchingUsers, data, conversationName } = this.state;
    const buttonDisabled = !selectedUsers || selectedUsers.length === 0 || loading;
    return (
      <div className="m-create-conv">
        <div className="m-create-conv__header">
          {conversationName ? (<h6>{conversationName}</h6>) : (<h6>New conversation</h6>)}
        </div>
        {!conversationName && (
          <div className="m-user-select-input m-create-conv__select">
            <Select
              className="user-select"
              mode="multiple"
              size="large"
              labelInValue
              value={selectedUsers}
              placeholder="Search"
              notFoundContent={fetchingUsers ? <Spin size="small" /> : null}
              filterOption={false}
              onSearch={this.fetchUser}
              onChange={this.handleChange}
              allowClear={true}
              showArrow={true}
            >
              {data && data.map((d: TUser) => (
                <Option key={d.id} value={d.id}>
                    <div className="multi-value-option-group">
                        <img src={d.profileImage} alt="" className="rounded-circle" />
                        <span className="value-option">{` ${d.fullName}`}</span>
                    </div>
                </Option>
              ))}
            </Select>
            <Button
              className="done-button"
              disabled={buttonDisabled}
              onClick={this.handleCreateClick}
              type="primary"
              loading={loading}
            >
              Done
            </Button>
          </div>
        )}
        <div className="m-create-conv__placeholder" />
        <div className="m-create-conv__message_editor">
          <Input.TextArea
            className="m-message_editor__input"
            disabled={conversationName.length === 0}
            onChange={this.handleMessageInputChange}
            placeholder="Type a message"
            rows={1}
            value={message}
          />
          <Button
            className="m-message_editor__send_button"
            disabled={message.length === 0}
            icon={<SendOutlined />}
            loading={loading}
            onClick={this.handleSendButtonClick}
            type="primary"
          >
            Send
          </Button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const users = get(state, 'users');
  const dmUserId = get(state, 'dmUserId');
  return { users, dmUserId }
};

const mapDispatchToProps = {
  checkDMG,
  createDMG,
  createMessage,
  fetchUsersList,
  selectConversation,
  createDmUserIdSuccess
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(CreateConversation, { name: "CreateConversation"}))
