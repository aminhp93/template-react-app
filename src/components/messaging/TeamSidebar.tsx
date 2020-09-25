import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { Skeleton, Tooltip } from 'antd';
import { get } from 'lodash';

import { TTeam } from 'types';
import { isStaff, canManagePlatform } from './userInfo';

import TeamList from './TeamList';
import CreateTeamWrapper from './CreateTeamWrapper';
import { ContactUserSupportButton } from './ContactUserSupportButton';
import { FaqButton } from './FaqButton';
import { ChangeLogButton } from './ChangeLogButton';


function CreateTeamButton(props) {
  return (
    <Tooltip placement="right" title="Create a new team">
      <div className="meta-button" onClick={props.onClick}>
        <div className="create-team-button">
          <i className="fa fa-plus" />
        </div>
      </div>
    </Tooltip>
  );
}

interface ITeamSidebarProps {
  /**
   * Reference to list of all teams in the store
   */
  teams: TTeam[];

  /**
   * Callback to get a list of notifications for teams for user
   */
  authUser: any;
}

class TeamSidebar extends React.Component<ITeamSidebarProps> {
  state = {
    modal: false,
  };

  toggleModal = () => {
    const { modal } = this.state;
    this.setState({ modal: !modal });
  };

  canCreateTeam = () => {
    const { authUser } = this.props;
    return isStaff(authUser) || canManagePlatform(authUser);
  };

  render() {
    // console.log('TeamSidebar')
    const { teams } = this.props;
    const { modal } = this.state;
    return (
      <div className="m-workspace__team_sidebar">
        <div className="m-team_sidebar__list__wrapper">
          {teams === null ? (
            <Skeleton
              active
              paragraph={{ rows: 6 }}
              title={false}
              className="teams-loading-skeleton"
            />
          ) : (
            <TeamList />
          )}
        </div>
        <div className="m-team_sidebar__meta__wrapper">
          {modal && (
            <CreateTeamWrapper
              onModalClose={() => this.setState({ modal: false })}
            />
          )}

          {this.canCreateTeam() && (
            <CreateTeamButton onClick={this.toggleModal} />
          )}
          <ContactUserSupportButton />
          <FaqButton />
          <ChangeLogButton />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    teams: get(state, 'teams') || {},
    authUser: get(state, 'authUser') || {},
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(TeamSidebar, { name: "TeamSidebar"}));
