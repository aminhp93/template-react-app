import * as Sentry from '@sentry/react';
import React from 'react';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { connect } from 'react-redux';
import { Select, Spin, Button } from 'antd';
import { debounce, get, map } from 'lodash';

import { ModalKey } from 'types';
import { fetchUsersList } from 'reducers/users';
import { addTeamMember } from 'reducers/teams';
import { getChatUserFullName } from './utils';
import { getUserProgramAbbr } from 'utils/userInfo';
import { DEFAULT_PROFILE_IMAGE_URL } from 'constants/common';
import ConfirmModal from './ConfirmModal';

const logger = new Logger(__filename);
const { Option } = Select;

interface IProps {
  addTeamMember?: any;
  onModalClose: any;
  selectedConversation: any;
  selectedTeam: any;
  selectedTeamId: number;
  fetchUsersList: any;
}

interface IState {
  selectedUsers: any;
  data: any;
  fetching: boolean;
  isCongratulationModal: boolean;
  loading: boolean;
}

class AddTeamMemberWrapper extends React.PureComponent<IProps, IState> {
  lastFetchId: number;

  state = {
    data: [],
    selectedUsers: [],
    fetching: false,
    isCongratulationModal: false,
    loading: false,
  };
  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.fetchUser = debounce(this.fetchUser, 800);
  }

  fetchUser = async (term) => {
    try {
      const { selectedTeamId, fetchUsersList } = this.props;

      this.lastFetchId += 1;
      const fetchId = this.lastFetchId;
      this.setState({ data: [], fetching: true });
      const dataRequest = {
        term,
        notInTeam: selectedTeamId,
      };
      const response = await fetchUsersList(dataRequest);
      if (fetchId !== this.lastFetchId) {
        // for fetch callback order
        return;
      }

      const data = response.data.results.map((user) => {
        return {
          value: user.id,
          label: getChatUserFullName(user),
          avatar: user.profileImage || DEFAULT_PROFILE_IMAGE_URL,
          sessionShortName: user.sessionShortName,
        };
      });
      this.setState({ data, fetching: false });
    } catch (error) {
      logger.error(error);
      this.setState({ fetching: false });
    }
  };

  handleChange = (value) => {
    this.setState({
      selectedUsers: value,
      data: [],
      fetching: false,
    });
  };

  addMembers = () => {
    try {
      const { selectedUsers } = this.state;
      const { addTeamMember, selectedTeam } = this.props;
      const selectedUserIds = map(selectedUsers, 'key');

      this.setState({ loading: true });
      addTeamMember(selectedTeam.id, selectedUserIds);
      this.setState({
        loading: false,
        isCongratulationModal: true,
      });
    } catch (error) {
      logger.error(error);
      this.setState({ loading: false });
    }
  };

  render() {
    const { onModalClose, selectedTeam } = this.props;
    const {
      fetching,
      data,
      selectedUsers,
      isCongratulationModal,
      loading,
    } = this.state;
    return (
      <ConfirmModal
        modalKey={ModalKey.ADD_TEAM_MEMBER}
        title={
          isCongratulationModal
            ? 'Congratulations!'
            : `Add people to ${selectedTeam.displayName} team`
        }
        onCancel={onModalClose}
        disabled={false}
        footer={false}
      >
        <div
          className={`add-team-member-wrapper ${
            isCongratulationModal ? '' : 'flex'
          }`}
        >
          {isCongratulationModal ? (
            <>
              <p className="congratulation-desc">
                More people have joined your team.
              </p>
              <div className="list-member-choose">
                {selectedUsers.map((user) => (
                  <div
                    className="list-member-items mr-2 ml-2 mt-2"
                    key={user.key}
                  >
                    <span>{user.label}</span>
                  </div>
                ))}
              </div>
              <div className="text-right">
                <Button
                  type="primary"
                  className="btn-messging-default"
                  onClick={onModalClose}
                >
                  Ok
                </Button>
              </div>
            </>
          ) : (
            <>
              <Select
                mode="multiple"
                labelInValue
                size="large"
                value={selectedUsers}
                placeholder="Search"
                notFoundContent={fetching ? <Spin size="small" /> : null}
                filterOption={false}
                onSearch={this.fetchUser}
                onChange={this.handleChange}
                style={{ width: '100%' }}
                allowClear={true}
              >
                {data.map((d) => (
                  <Option key={d.value} value={d.id}>
                    <div className="multi-value-option-group">
                      <img src={d.avatar} alt="" className="rounded-circle" />
                      <span className="value-option">{` ${d.label}`}</span>
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
              <Button
                loading={loading}
                disabled={loading || fetching}
                onClick={this.addMembers}
                type="primary"
              >
                Add
              </Button>
            </>
          )}
        </div>
      </ConfirmModal>
    );
  }
}

const mapStateToProps = (state) => {
  const conversations = get(state, 'conversations') || {};
  const selectedConversationId = get(state, 'selectedConversationId');
  const teams = get(state, 'teams') || {};
  const selectedTeamId = get(state, 'selectedTeamId');
  return {
    selectedConversation: conversations[selectedConversationId] || {},
    selectedTeam: teams[selectedTeamId] || {},
    selectedTeamId,
  };
};

const mapDispatchToProps = {
  addTeamMember,
  fetchUsersList,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sentry.withProfiler(AddTeamMemberWrapper, { name: "AddTeamMemberWrapper"}));
