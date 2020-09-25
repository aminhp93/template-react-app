import * as Sentry from '@sentry/react';
import * as React from 'react';
import { Skeleton } from 'antd';
import { partition, get } from 'lodash';
import { connect } from 'react-redux';

import { TConversation, ConversationType } from 'types';
import ConversationList from './ConversationList';
import BrowseChannelWrapper from './BrowseChannelWrapper';

interface IProps {
  conversations: TConversation[];
  selectedTeamId: number;
  authUser: any;
}

class ConversationListsWrapper extends React.PureComponent<IProps> {

  render() {
    const { conversations, selectedTeamId, authUser } = this.props;

    // conversations of interests: all channels for this team and all direct messages
    // group conversations
    const convOI =
      conversations &&
      Object.values(conversations).filter((conv) => {
        return (
          (conv.team === null || conv.team === selectedTeamId) &&
            conv.members &&
            conv.members.includes(authUser.id) &&
            conv.isHide === false &&
            conv.isArchived === false &&
            conv.isRemoved === false
        );
      });

    const [unreads, reads] = partition(
      convOI,
      (conv) => (!get(conv, 'isRead', true) || get(conv, 'mentionCount', 0) !== 0 || get(conv, 'isNew')) && !conv.isMute
    );
    const [favorites, others] = partition(reads, (conv) => conv.isFavorite);
    const [publics, privateAndDM] = partition(
      others,
      (conv) => conv.conversationType === ConversationType.Public
    );
    const [privates, messages] = partition(
      privateAndDM,
      (conv) => conv.conversationType === ConversationType.Private
    );
    const shouldLoading =
      publics.length === 0 &&
      privates.length === 0 &&
      unreads.length === 0 &&
      favorites.length === 0;

    return (
      <div className="m-conversation_list_wrapper">
        {shouldLoading ? (
          <Skeleton
            active={true}
            paragraph={{ rows: 6 }}
            className="conversations-loading-skeleton"
          />
        ) : (
          <>
            {unreads && (
              <ConversationList
                title="Unreads"
                conversations={unreads}
                compactDisplay={true}
              />
            )}
            {favorites && (
              <ConversationList
                title="Favorites"
                conversations={favorites}
                compactDisplay={true}
              />
            )}
            <ConversationList
              title="Public channels"
              conversations={publics}
              createButtonTooltip="Create a public channel"
              createType={ConversationType.Public}
            />
            <BrowseChannelWrapper />
            <ConversationList
              title="Private channels"
              conversations={privates}
              createButtonTooltip="Create a private channel"
              createType={ConversationType.Private}
            />
          </>
        )}

        <ConversationList
          title="Conversations"
          conversations={messages}
          createButtonTooltip="Create a message"
          createType={ConversationType.DirectMessage}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    authUser: get(state, 'authUser') || {},
    conversations: get(state, 'conversations'),
    selectedTeamId: get(state, 'selectedTeamId'),
  };
};

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sentry.withProfiler(ConversationListsWrapper, { name: "ConversationListsWrapper"}));
