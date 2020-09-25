import * as Sentry from '@sentry/react';
import React from 'react';
import { connect } from 'react-redux';
import { get, filter, map, debounce } from 'lodash';
import { components } from 'react-select-v2';
import AsyncSelect from 'react-select-v2/async';
import { ENTITY_TYPE, LIMIT_PARTICIPANTS } from 'utils/enums';
import { getChatUserFullName } from './utils';
import { DEFAULT_PROFILE_IMAGE_URL } from 'constants/common';

import MessagingModal from '../MessagingModal';
import { fetchUsersList } from 'reducers/users';
import { addTeamMember } from 'reducers/teams';

interface IDataProps {
  data: {
    value: any;
    label: string;
    avatar: string;
  };
}

function Option(props: IDataProps) {
  const { data } = props;

  return (
    <div className="multi-value-option-group">
      <components.Option {...props}>
        <img src={data.avatar} alt="" className="rounded-circle" />
        <span className="value-option"> {data.label}</span>
      </components.Option>
    </div>
  );
}
function MultiValueLabel({ data, ...props }: IDataProps) {
  return (
    <div className="multi-value-label-group">
      <components.MultiValueLabel {...props}>
        <img src={data.avatar} alt="" className="rounded-circle" />
        <span className="value-label">{data.label}</span>
      </components.MultiValueLabel>
    </div>
  );
}
function Placeholder({ ...props }) {
  return <>
    <i className="fa fa-search" />
    <components.Placeholder {...props} />
  </>;
}
function NoOptionsMessage({ ...props }) {
  return (
    <div className="no-option-message">
      <components.NoOptionsMessage {...props}>
        <span className="no-option-message__text">
          {`We can't find anyone with that name.`}
        </span>
      </components.NoOptionsMessage>
    </div>
  );
}

interface IProps {
  title: string;
  onModalClose?: any;
  teams?: any;
  conversations?: any;
  selectedTeamId?: number;
  selectedConversationId?: number;
  fetchUsersList?: any;
  addTeamMember?: any;
}

interface IState {
  selectedUsers: any;
  defaultOptions: any;
  isAdding: boolean;
  errorMessage: string;
  isCongratulationModal: boolean;
}

class AddMemberModal extends React.PureComponent<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      selectedUsers: null,
      defaultOptions: [],
      isAdding: false,
      errorMessage: null,
      isCongratulationModal: false,
    };

    this.loadOptionsAsync = debounce(this.loadOptionsAsync, 400);
  }

  componentDidMount() {
    this.getDefaultOptions();
  }

  getDefaultOptions = () => {
    const { selectedUsers } = this.state;
    const { selectedTeamId } = this.props;
    if (!selectedTeamId) return;
    const data = {
      term: '',
      notInTeam: selectedTeamId,
    };
    this.props.fetchUsersList(data).then((res) => {
      const selectedUserIds = map(selectedUsers, 'value');
      this.setState({
        defaultOptions: filter(
          res.data.results.map(this.displayUserOption),
          ({ value }) => !selectedUserIds.includes(value)
        ),
      });
    });
  };

  handleChange = (selectedUsers) => {
    if (selectedUsers && selectedUsers.length > LIMIT_PARTICIPANTS) {
      this.setState(
        {
          errorMessage: `You reach the limit number of ${LIMIT_PARTICIPANTS} participants`,
        },
        () => {
          setTimeout(() => {
            this.setState({
              errorMessage: null,
            });
          }, 3000);
        }
      );
      return;
    }
    this.setState({ selectedUsers });
  };

  isAddedToTeam = () => {
    return this.props.title === ENTITY_TYPE.TEAM;
  };

  displayUserOption = (user) => ({
    value: user.id,
    label: getChatUserFullName(user),
    avatar: user.profileImage || DEFAULT_PROFILE_IMAGE_URL,
  });

  loadOptionsAsync = (term) =>
    new Promise((resolve) => {
      const { selectedUsers } = this.state;
      const { selectedTeamId } = this.props;
      if (!selectedTeamId) return;
      const data = {
        term,
        notInTeam: selectedTeamId,
      };
      this.props.fetchUsersList(data).then((res) => {
        const selectedUserIds = map(selectedUsers, 'value');
        const results = res.data.results.map(this.displayUserOption);
        resolve(
          filter(results, ({ value }) => !selectedUserIds.includes(value))
        );
      });
    });

  addMembers = () => {
    if (this.isAddedToTeam()) {
      try {
        const { selectedUsers } = this.state;
        const selectedUserIds = map(selectedUsers, 'value');
        this.setState({ isAdding: true });
        this.props.addTeamMember({ selectedUserIds });
        this.setState({
          isAdding: false,
          isCongratulationModal: true,
        });
      } catch (error) {
        this.setState({
          isAdding: false,
          errorMessage: 'Error',
        });
      }
    }
  };

  renderTitleModal = () => {
    if (this.isAddedToTeam()) {
      const { selectedTeamId, teams } = this.props;
      const selectedTeam = teams[selectedTeamId];
      return `Add people to ${selectedTeam.displayName} team`;
    }
    const { selectedConversationId, conversations } = this.props;
    const selectedConversation = conversations[selectedConversationId];
    return `Add people to ${selectedConversation.conversation_name} channel`;
  };

  render() {
    const { onModalClose } = this.props;
    const {
      selectedUsers,
      defaultOptions,
      isAdding,
      errorMessage,
      isCongratulationModal,
    } = this.state;
    if (isCongratulationModal) {
      return (
        <MessagingModal id="addMemberCongratulation" close={onModalClose}>
          <>
            <h5 className="mb-3 mt-3 mb-1 title-modal">Congratulations!</h5>
            <p className="congratulation-desc">
              More people have joined your{' '}
              {this.isAddedToTeam() ? 'team' : 'channel'}.
            </p>
            <div className="list-member-choose">
              {selectedUsers.map((user) => (
                <div
                  className="list-member-items mr-2 ml-2 mt-2"
                  key={user.value}
                >
                  <img
                    src={user.avatar}
                    alt={user.label}
                    className="mr-2 rounded-circle"
                  />
                  <span>{user.label}</span>
                </div>
              ))}
            </div>
            <div className="text-right">
              <button
                className="ok-button btn btn-primary btn-add-custom mb-5"
                onClick={onModalClose}
              >
                OK
              </button>
            </div>
          </>
        </MessagingModal>
      );
    }
    return (
      <MessagingModal id="addMember" close={() => onModalClose()}>
        <>
          <h5 className="mb-3 mt-3 title-modal">{this.renderTitleModal()}</h5>
          {errorMessage ? (
            <div className="error-message">{errorMessage}</div>
          ) : null}
          <div className="form-group">
            <div className="form-group__select">
              <AsyncSelect
                className="add-member-select"
                value={selectedUsers}
                onChange={this.handleChange}
                placeholder="Search"
                isMulti
                cacheOptions
                defaultOptions={defaultOptions}
                isDisabled={isAdding}
                loadOptions={this.loadOptionsAsync}
                components={{
                  Option,
                  MultiValueLabel,
                  Placeholder,
                  NoOptionsMessage,
                }}
              />
            </div>
          </div>
          <div className="text-right">
            <button
              className="submit-button btn btn-primary btn-add-custom"
              disabled={
                !selectedUsers || selectedUsers.length === 0 || isAdding
              }
              onClick={this.addMembers}
            >
              Add
            </button>
          </div>
        </>
      </MessagingModal>
    );
  }
}

const mapStateToProps = (state) => ({
  teams: get(state, 'teams'),
  conversations: get(state, 'conversations'),
  selectedTeamId: get(state, 'selectedTeamId'),
  selectedConversationId: get(state, 'selectedConversationId'),
});

const mapDispatchToProps = {
  fetchUsersList,
  addTeamMember,
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(AddMemberModal, { name: "AddMemberModal"}));
