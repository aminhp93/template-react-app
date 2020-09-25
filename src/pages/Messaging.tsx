import * as React from 'react';
import * as Sentry from '@sentry/react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { get } from 'lodash';
import clsx from 'clsx';
import { dispatch } from "store";
import { Base64 } from 'js-base64';

import {
  TUser,
  TTeam,
  TConversation,
  PrimaryView,
  TPrimaryView,
  SecondaryView,
} from 'types';

import { fetchTeamList, selectTeam, selectTeamDmg } from 'reducers/teams';
import { fetchTeamNotifications } from 'reducers/teamNotifications';
import {
  fetchDMGList,
  getDMGsNotifications,
  checkDMG,
  createDmUserIdSuccess,
  selectConversation,
} from 'reducers/conversations';
import { updatePrimaryView } from 'reducers/views';
import { fetchUsersList } from 'reducers/users'

import TeamSidebar from 'components/messaging/TeamSidebar';
import ConversationSidebar from 'components/messaging/ConversationSidebar';
import ConversationHeader from 'components/messaging/ConversationHeader';
import ConversationInfo from 'components/messaging/ConversationInfo';
import ConversationPlaceholder from 'components/messaging/ConversationPlaceholder';
import CreateConversation from 'components/messaging/CreateConversation';
import MessagingWrapper from 'components/messaging/MessagingWrapper';
import ThreadListWrapper from 'components/messaging/ThreadListWrapper';
import ThreadDetailWrapper from 'components/messaging/ThreadDetailWrapper';
import PageTitle from 'components/PageTitle';
import RedirectFromUrl from 'components/messaging/RedirectFromUrl';
import SavedItemsListWrapper from 'components/messaging/SavedItemsListWrapper';


export type IProps = {
  authUser: TUser;
  selectedConversationId: number;
  primaryView: TPrimaryView;
  secondaryView: SecondaryView;

  fetchTeamList: () => Promise<{ data: TTeam[] }>;
  fetchTeamNotifications: () => void;
  selectTeam: (teamId: number, channel?: string, threadId?: number) => void;
  selectTeamDmg: (teamId: number) => void;
  fetchDMGList: () => Promise<{ data: TConversation[] }>;
  getDMGsNotifications: () => Promise<void>;
  selectConversation: (conversationId: number, scrollTop?: number, threadId?: number) => void;

  checkDMGAction: (params?: any) => Promise<any>;
  fetchUsersList: any;
};

class Messaging extends React.Component<RouteComponentProps & IProps> {

  async componentDidMount() {
    const {
      authUser,
      match,
      fetchTeamList,
      fetchTeamNotifications,
      selectTeam,
      selectTeamDmg,
      fetchDMGList,
      getDMGsNotifications,
      selectConversation,
      fetchUsersList
    } = this.props;

    const [teams, dmgs] = await Promise.all([
      fetchTeamList(),
      fetchDMGList(),
      fetchTeamNotifications(),
    ]);

    // This need to be done here, after fetchDMGList since DMGs don't
    // have a seprate store for notifications
    await getDMGsNotifications();

    if (!teams.data || !teams.data.length) {
      // Someone without a team
      return;
    }

    const team_or_group_dm_slug = match.params.team;
    const channel_slug_or_thread_slug = match.params.conversation;
    const thread_slug = match.params.thread;
    let dmUserId;
    let isChannel = false;
    let threadId;
    // Detect created new DM
    try {
      dmUserId = get(JSON.parse(Base64.decode(team_or_group_dm_slug)), 'dmUserId');
      // Check again
      // Selected first team
      try {
        // dm exist
        const dmg = await this.props.checkDMGAction([dmUserId, authUser.id]);
        selectConversation(dmg.id);
        selectTeamDmg(teams.data[0].id);
      } catch(err) {
        selectTeamDmg(teams.data[0].id);
        // get user profile
        await fetchUsersList({ ids: [dmUserId]})
        await dispatch(createDmUserIdSuccess(dmUserId));
        await dispatch(updatePrimaryView(PrimaryView.CreateConversation));
      }
      return
    } catch (e) {
      // TODO
    }
    // Detect is channel slug or thread slug
    if (channel_slug_or_thread_slug) {
      try {
          threadId = get(JSON.parse(Base64.decode(channel_slug_or_thread_slug)), 'id');
          isChannel = false;
      } catch(e) {
          isChannel = true;
          if(thread_slug) {
            try {
                threadId = get(JSON.parse(Base64.decode(thread_slug)), 'id');
            } catch (e) {
              // TODO
            }
          }
      }
    }
    if (isChannel) {
      const team = teams.data.find((t: TTeam) => t.name === team_or_group_dm_slug);
      if (team) {
        selectTeam(team.id, channel_slug_or_thread_slug, threadId);
      } else {
        selectTeam(teams.data[0].id);
      }
    } else {
      // It as team slug or dmg slug
      // Find group or dm
      const conversation = dmgs.data.find((c: TConversation) => c.slug === team_or_group_dm_slug);
      if (conversation) {
        selectConversation(conversation.id, null, threadId);
        // Selected first team if go to group or dm
        selectTeamDmg(teams.data[0].id);
      } else {
        // Goto select team
        const team = teams.data.find((t: TTeam) => t.name === team_or_group_dm_slug);
        if (team) {
          selectTeam(team.id);
        } else {
          selectTeam(teams.data[0].id);
        }
      }
    }
  }

  renderPrimaryView = () => {
    const { selectedConversationId, primaryView } = this.props;
    if (selectedConversationId) {
      if (primaryView === PrimaryView.ConversationDetail) {
        return (
          <>
            <ConversationHeader />
            <MessagingWrapper />
          </>
        );
      }
    }
    if (primaryView === PrimaryView.CreateConversation) {
      return <CreateConversation />;
    }
    return <ConversationPlaceholder />;
  };

  renderSecondaryView = () => {
    const { secondaryView } = this.props;
    switch (secondaryView) {
      case SecondaryView.CONVERSATION_INFO:
        return <ConversationInfo />;
      case SecondaryView.THREAD_LIST:
        return <ThreadListWrapper />;
      case SecondaryView.THREAD_DETAIL:
        return <ThreadDetailWrapper />;
      case SecondaryView.SAVED_MESSAGE_LIST:
        return <SavedItemsListWrapper />;
      default:
        return null
    }
  };

  render() {
    // console.log('Messaging')
    const { secondaryView } = this.props;

    const viewingThread = [
      SecondaryView.THREAD_LIST,
      SecondaryView.THREAD_DETAIL,
    ].includes(secondaryView);

    const viewingBorderLeft = [
      SecondaryView.THREAD_LIST,
      SecondaryView.THREAD_DETAIL,
      SecondaryView.SAVED_MESSAGE_LIST,
    ].includes(secondaryView);

    return (
      <div className="m-workspace">
          <RedirectFromUrl />
          <PageTitle />
          <TeamSidebar />
          <ConversationSidebar />
          <div className="m-workspace__primary_view conversation-view-chat chat-container--conversation-detail-tab conversation-view-chat">
            {this.renderPrimaryView()}
          </div>
          {secondaryView ? (
            <div
              className={clsx('m-workspace__secondary_view', {
                'chat-container--thread thread': viewingThread,
                'border-left': viewingBorderLeft
              })}
            >
              {this.renderSecondaryView()}
            </div>
          ) : null}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const selectedConversationId = get(state, 'selectedConversationId');
  const primaryView = get(state, 'primaryView');
  const secondaryView = get(state, 'secondaryView');
  const authUser = get(state, 'authUser') || {};

  return {
    authUser,
    primaryView,
    secondaryView,
    selectedConversationId,
  };
};

const mapDispatchToProps = {
  fetchTeamList,
  fetchTeamNotifications,
  selectTeam,
  selectTeamDmg,
  fetchDMGList,
  getDMGsNotifications,
  selectConversation,
  checkDMGAction: checkDMG,
  fetchUsersList
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(Sentry.withProfiler(Messaging));
