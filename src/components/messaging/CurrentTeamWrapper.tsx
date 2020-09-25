import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dropdown, Menu } from 'antd';
import { get } from 'lodash';

import { TTeam } from 'types';
import { leaveTeam } from 'reducers/teams';
import { updateNotificationPreferences } from 'reducers/authUser';

import LeaveTeamModal from './LeaveTeamModal';
import CreateTeamWrapper from './CreateTeamWrapper';
import AddTeamMemberWrapper from './AddTeamMemberWrapper';
import { TeamManageMembersModal } from './TeamManageMembersModal';
import { NotificationPreferencesModal } from './NotificationPreferencesModal';

interface IProps {
  authUser: any;
  teams: TTeam[];
  leaveTeam: any;
  selectedTeamId: number;
  updateNotificationPreferences: any;
  currentPushNotificationChoice: any;
  currentEmailNotificationChoice: any;
  fetchUsersForTeam?(id?: number): Promise<void>;
}

interface IState {
  modal: string | null;
}

class CurrentTeamWrapper extends React.Component<IProps, IState> {
  state = {
    modal: null,
  };

  handleMenuItemClick = (e) => {
    this.setState({ modal: e.key });
  };

  closeModal = () => {
    this.setState({ modal: null });
  };

  render(): React.ReactNode {
    const {
      authUser,
      teams,
      selectedTeamId,
      leaveTeam,
      updateNotificationPreferences,
      currentPushNotificationChoice,
      currentEmailNotificationChoice,
    } = this.props;
    const { modal } = this.state;

    if (!teams) return null;
    const selectedTeam: TTeam = teams[selectedTeamId];

    const isAdmin = selectedTeam && selectedTeam.admins && selectedTeam.admins.includes(authUser.id);

    // Note: have to create a menu node inside this render function instead of making
    // it a separate component to prevent antd Menu being generated weirdly
    let menu = (
      <Menu onClick={this.handleMenuItemClick}>
        <Menu.Item key="manageMember">View members</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="notificationPreferences">
          Notification preferences
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="leaveTeam">Leave team</Menu.Item>
      </Menu>
    );

    if (isAdmin) {
      menu = (
        <Menu onClick={this.handleMenuItemClick}>
          <Menu.Item key="teamInfo">View team information</Menu.Item>
          <Menu.Divider />
          <Menu.Item key="addMember">Add members to team</Menu.Item>
          <Menu.Item key="manageMember">Manage members</Menu.Item>
          <Menu.Divider />
          <Menu.Item key="notificationPreferences">
            Notification preferences
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="leaveTeam">Leave team</Menu.Item>
        </Menu>
      );
    }

    return (
      <div className="m-conversation_sidebar__current_team">
        <div className="m-current_team__name">
          <h1>{(selectedTeam || {}).displayName}</h1>
        </div>
        <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
          <div className="m-current_team__team_dropdown m-dropdown__ellipsis">
            <i className="fa fa-ellipsis-v" />
          </div>
        </Dropdown>

        {modal && modal === 'addMember' && (
          <AddTeamMemberWrapper onModalClose={this.closeModal} />
        )}

        {modal && modal === 'teamInfo' && (
          <CreateTeamWrapper onModalClose={this.closeModal} isEditable={true} />
        )}

        {modal && modal === 'manageMember' && (
          <TeamManageMembersModal onCancel={this.closeModal} />
        )}
        {/* Somehow this won't work if we only use modal === 'notificationPreferences' */}
        {modal && modal === 'notificationPreferences' && (
          <NotificationPreferencesModal
            currentPushNotificationChoice={currentPushNotificationChoice}
            currentEmailNotificationChoice={currentEmailNotificationChoice}
            onOk={updateNotificationPreferences}
            onCancel={this.closeModal}
          />
        )}

        {modal === 'leaveTeam' && (
          <LeaveTeamModal
            team={selectedTeam}
            onOk={leaveTeam}
            onCancel={this.closeModal}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const authUser = get(state, 'authUser') || {};
  return {
    authUser,
    selectedTeamId: get(state, 'selectedTeamId'),
    teams: get(state, 'teams'),
    currentPushNotificationChoice: get(
      authUser,
      'preferences.push_notification_type'
    ),
    currentEmailNotificationChoice: get(
      authUser,
      'preferences.messaging_email_time_window'
    ),
  };
};

const mapDispatchToProps = {
  leaveTeam,
  updateNotificationPreferences
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(CurrentTeamWrapper, { name: "CurrentTeamWrapper"}));
