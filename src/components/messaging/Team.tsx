import * as Sentry from '@sentry/react';
import React, { MouseEvent } from 'react';
import { connect } from 'react-redux';
import { Badge, Tooltip } from 'antd';
import { DraggableProvided } from 'react-beautiful-dnd';
import clsx from 'clsx';

import { TTeam } from 'types';
import { TeamAvatar } from './TeamAvatar';

export interface IProps {
  team: TTeam;
  isActive: boolean;
  teamNotifications: any;
  onClick(e: MouseEvent<HTMLElement>): void;
  dnd?: DraggableProvided
}

function Team(props) {
  const renderTeamBadge = (team: TTeam) => {
    const { teamNotifications } = props;
    const teamNoti = teamNotifications[team.id] || {};

    let node = (
      <div className="m-team_sidebar__avatar">
        <TeamAvatar team={team} />
      </div>
    );

    const mentionCount = teamNoti ? teamNoti.mentionCount : 0;
    const isRead = teamNoti && teamNoti.isRead;

    if (mentionCount > 0) {
      node = (
        <Badge className="m-team_sidebar__avatar" count={mentionCount}>
          <TeamAvatar team={team} />
        </Badge>
      );
    } else if (isRead === false) {
      node = (
        <Badge className="m-team_sidebar__avatar" dot>
          <TeamAvatar team={team} />
        </Badge>
      );
    }

    return node;
  };

  const {
    team, isActive, onClick: handleClick,
    dnd: { innerRef, draggableProps, dragHandleProps }
  } = props;

  return (
    <Tooltip placement="right" title={team.displayName}>
      <div
        className={clsx('m-team_sidebar__list__item', { isActive })}
        onClick={handleClick}
        ref={innerRef}
        {...draggableProps}
        {...dragHandleProps}
      >
        {renderTeamBadge(team)}
      </div>
    </Tooltip>
  );
}

const mapStateToProps = (state) => {
  return {
    teamNotifications: state.teamNotifications || {},
    authUser: state.authUser || {},
  };
};

export default connect(mapStateToProps, null)(Sentry.withProfiler(Team, { name: "Team"}));
