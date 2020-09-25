import * as React from 'react';
import { compose } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';


export type StandaloneProps = {
  title: string
};

export type ConnectedProps = RouteComponentProps & {
  teams?: any,
  selectedTeamId?: any,
  conversations?: any,
  selectedConversationId?: any,
  title?: string
};

export class PageTitle extends React.Component<StandaloneProps | ConnectedProps> {

  getPageTitle() {
    const { title } = this.props as StandaloneProps;
    if (title) {
      return title;
    }

    const {
      teams,
      selectedTeamId,
      conversations,
      selectedConversationId,
    } = this.props as ConnectedProps;

    const team = teams[selectedTeamId];
    const conversation = conversations[selectedConversationId];

    let parts = [];
    if (team) {
      parts.push(team.displayName);
    }
    if (conversation) {
      if (['D', 'G'].includes(conversation.conversationType)) {
        parts = [];
      }
      parts.push(conversation.conversationName);
    }

    return parts.join(' - ') || 'Loading';
  }

  componentDidMount() {
    document.title = `${this.getPageTitle()} | Insight Community Platform`;
  }

  componentDidUpdate() {
    document.title = `${this.getPageTitle()} | Insight Community Platform`;
  }

  render() {
    return null;
  }
}

const mapStateToProps = (state) => {
  const conversations = state.conversations || {};
  const selectedConversationId = state.selectedConversationId;
  const teams = state.teams || {};
  const selectedTeamId = state.selectedTeamId;

  return {
    teams,
    selectedTeamId,
    conversations,
    selectedConversationId,
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps)
)(PageTitle)
