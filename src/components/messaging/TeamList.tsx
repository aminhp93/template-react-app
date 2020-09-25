import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import {
  DragDropContext, Droppable, Draggable, DropResult
} from 'react-beautiful-dnd';
import { orderBy } from 'lodash';

import Team from './Team';
import { TTeam } from 'types';
import {
  selectTeam as selectTeamAction,
  reorder as reorderTeamAction
} from 'reducers/teams';


export type IProps = {
  teams: TTeam[];
  selectedTeamId: number | null;
  selectTeam: any;
  reorder: (id: number, index: number) => void;
};

export class TeamList extends React.PureComponent<IProps> {

  onDragEnd = (e: DropResult) => {
    if (!e.destination) return;

    this.props.reorder(
      parseInt(e.draggableId, 10),
      e.destination.index
    )
  };

  render() {
    const { teams, selectedTeamId, selectTeam } = this.props;
    if (!teams) return null;
    let teamList = Object.values(teams).filter((v) => v && !!v.displayName);
    teamList = orderBy(teamList, ['order', 'created'], ['asc', 'desc']);

    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="teamList">
          {({ innerRef, droppableProps, placeholder }) => (
            <div className="m-team_sidebar__list" ref={innerRef} {...droppableProps}>
              {teamList.map((team: TTeam, index: number) => (
                <Draggable key={team.id} draggableId={`${team.id}`} index={index}>
                  {(dnd) => (
                    <Team
                      team={team}
                      isActive={team.id === selectedTeamId}
                      onClick={() => selectTeam(team.id)}
                      dnd={dnd}
                    />
                  )}
                </Draggable>
              ))}
              {placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    teams: state?.teams || {},
    selectedTeamId: state?.selectedTeamId || {},
  };
};

const mapDispatchToProps = {
  selectTeam: selectTeamAction,
  reorder: reorderTeamAction
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(TeamList, { name: "TeamList"}));
