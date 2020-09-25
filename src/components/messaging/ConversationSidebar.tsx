import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

import { SecondaryView, SearchType } from 'types';
import {
  fetchDMGList,
  getDMGsNotifications,
  selectConversation,
} from 'reducers/conversations';
import { updateSecondaryView as updateSecondaryViewAction } from 'reducers/views';

import CurrentTeamWrapper from './CurrentTeamWrapper';
import UserInfoWrapper from './UserInfoWrapper';
import ThreadListTrigger from './ThreadListTrigger';
import SavedItemsListTrigger from './SavedItemsListTrigger';
import ConversationListsWrapper from './ConversationListsWrapper';
import Search from './Search';

interface IProps {
  selectedTeamId: number | null;
  threadNotifications: any;
  getDMGsNotifications: () => Promise<any>;
  fetchDMGList: () => Promise<any>;
  updateSecondaryView: (params?: any) => Promise<any>;

  selectConversation: any;
}

class ConversationSidebar extends React.Component<IProps> {
  private getThreadBadgeNotification = () => {
    const { threadNotifications, selectedTeamId } = this.props;
    const teamNoti = threadNotifications[selectedTeamId];
    const dmgNoti = threadNotifications.null;
    const isAllThreadsRead =
      get(teamNoti, 'isRead', true) && get(dmgNoti, 'isRead', true);
    const allThreadMentionCount =
      get(teamNoti, 'mentionCount', 0) + get(dmgNoti, 'mentionCount', 0);
    return { isAllThreadsRead, allThreadMentionCount };
  };

  // shouldComponentUpdate(nextProps, nextState) {
  //   const { threadNotifications } = this.props;
  //   const { threadNotifications: nextThreadNotifications } = nextProps;
    
  //   return !(JSON.stringify(threadNotifications) === JSON.stringify(nextThreadNotifications)
  //       && JSON.stringify(nextState) === JSON.stringify(this.state));

  // }

  public render(): React.ReactNode {
    // console.log('ConversationSidebar')
    const { updateSecondaryView } = this.props;

    const {
      isAllThreadsRead,
      allThreadMentionCount,
    } = this.getThreadBadgeNotification();

    return (
      <div className="m-workspace__conversation_sidebar">
        <CurrentTeamWrapper />
        <UserInfoWrapper />
        <Search />
        <ThreadListTrigger
          isRead={isAllThreadsRead}
          mentionCount={allThreadMentionCount}
          onClick={() => updateSecondaryView(SecondaryView.THREAD_LIST)}
        />
        <SavedItemsListTrigger onClick={() => updateSecondaryView(SecondaryView.SAVED_MESSAGE_LIST)} />
        <ConversationListsWrapper />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const threadNotifications = get(state, 'threadNotifications');
  return {
    selectedTeamId: get(state, 'selectedTeamId'),
    threadNotifications,
  };
};

const mapDispatchToProps = {
  fetchDMGList,
  getDMGsNotifications,
  selectConversation,
  updateSecondaryView: updateSecondaryViewAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(ConversationSidebar, { name: "ConversationSidebar"}));
