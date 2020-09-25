import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { compile } from 'path-to-regexp';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { ConversationType } from "types";


export type TProps = {
  selectedTeamId: number,
  selectedConversationId: number,
  selectedThreadDetail: number,
  teams: any,
  conversations: any,
  messages: any,
  history: any,
  match: any,
  location: any,
};

class RedirectFromUrl extends React.Component<TProps> {

  componentDidUpdate(prevProps) {
    const {
      history,
      match,
      teams,
      messages,
      selectedTeamId,
      conversations,
      selectedConversationId,
      selectedThreadDetail,
      location
    } = this.props;
    let { search } = location;

    if (
      (this.props.selectedTeamId && prevProps.selectedTeamId && this.props.selectedTeamId !== prevProps.selectedTeamId) ||
      (this.props.selectedConversationId && prevProps.selectedConversationId && this.props.selectedConversationId !== prevProps.selectedConversationId)
    ) {
      search = ''
    } 

    const params = { team: null, conversation: null, thread: null }
    if (selectedTeamId) {
      params.team = teams[selectedTeamId] && teams[selectedTeamId].name;
    }

    if (selectedConversationId && conversations[selectedConversationId]) {
      params.conversation = conversations[selectedConversationId].slug;
    }

    if (
      conversations[selectedConversationId] &&
      [ConversationType.DirectMessage, ConversationType.Group].includes(
        conversations[selectedConversationId].conversationType
      )
    ) {
      params.team = params.conversation;
      if (selectedThreadDetail && messages[selectedThreadDetail]) {
        params.conversation = (messages[selectedThreadDetail] || {}).slug;
      } else {
        params.conversation = null;
      }
    } else {
      if (selectedThreadDetail && messages[selectedThreadDetail]) {
        params.thread = (messages[selectedThreadDetail] || {}).slug;
      }
    }
    if (
      (params.team && params.team !== match.params.team) ||
      (params.conversation && params.conversation !== match.params.conversation) ||
      (!params.conversation && match.params.conversation) || 
      (params.thread && !match.params.thread) ||
      (!params.thread && match.params.thread) ||
      (params.thread && match.params.thread && params.thread !== match.params.thread)
    ) {
      // FIXME: Hm, if we favor the store here everything seems to work,
      // but we break browser history functions (back/forward button).
      history.push({
        pathname: compile(match.path)(params),
        search
      });
    }
  }

  render() {
    return null;
  }
}

const mapStateToProps = (state) => {
  return {
    teams: get(state, 'teams') || {},
    conversations: get(state, 'conversations') || {},
    messages: get(state, 'messages') || {},
    selectedTeamId: get(state, 'selectedTeamId'),
    selectedConversationId: get(state, 'selectedConversationId'),
    selectedThreadDetail: get(state, 'selectedThreadDetail')
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps, null)
)(Sentry.withProfiler(RedirectFromUrl, { name: "RedirectFromUrl"}))
