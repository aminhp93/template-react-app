import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { TConversation, ConversationType } from 'types';
import { selectConversation as selectConversationAction } from 'reducers/conversations';

import ConversationItem from './ConversationItem';
import CreateConversationWrapper from './CreateConversationWrapper';
import BrowseChannelWrapper from './BrowseChannelWrapper';

interface IProps {
  title?: string;
  conversations: TConversation[];
  createType: ConversationType | null;
  createButtonTooltip?: string;
  selectedConversationId: number | null;
  /**
   * Whether conversation items will be displayed in compact mode.
   * This is used for DMG items in Unreads/Favorite list
   */
  compactDisplay?: boolean;

  /**
   * Callback invoked to select a conversation
   * @param id number: Id of the conversation
   * @param scrollTop
   */
  selectConversation?(id: number, scrollTop: number): void;
}

class ConversationList extends React.Component<IProps> {
  static defaultProps: IProps = {
    title: '',
    conversations: [],
    selectedConversationId: null,
    createType: null,
    createButtonTooltip: '',
  };

  render(): React.ReactNode {
    const {
      title,
      conversations,
      createType,
      createButtonTooltip,
      selectedConversationId,
      selectConversation,
      compactDisplay,
    } = this.props;

    if (
      conversations.length === 0 &&
      ['Unreads', 'Favorites'].includes(title)
    ) {
      return null;
    }

    // Sort conversations
    // Direct messages and group coversations are sort descendingly by `modified`
    if (createType === ConversationType.DirectMessage) {
      conversations.sort((a, b) => (a.modified < b.modified ? 1 : -1));
    } else {
      // Channels are sorted alphabetically
      conversations.sort((a, b) =>
        a.conversationName.toLowerCase() > b.conversationName.toLowerCase()
          ? 1
          : -1
      );
    }
    const enableCreate =
      [
        ConversationType.Public,
        ConversationType.Private,
        ConversationType.DirectMessage,
      ].indexOf(createType) > -1;
    const showHiddenConversations = ConversationType.DirectMessage === createType;
    return (
      <div className="m-conversation_list">
        <div className="m-conversation_list__header">
          <h3 className="m-conversation_list__title">{title}</h3>
          <div className="m-conversation_list__actions">
            {showHiddenConversations && <BrowseChannelWrapper groupAndDmg />}
            
            {enableCreate && (
              <CreateConversationWrapper
                createType={createType}
                createButtonTooltip={createButtonTooltip}
              />
            )}
          </div>
          
        </div>
        {conversations.length > 0 ? (
          <div className="m-conversation_list__content">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === selectedConversationId}
                onClick={() => {
                  const selectedConversationDOM = document.getElementById('main-chat-container');
                  const scrollTop = selectedConversationDOM
                    ? selectedConversationDOM.scrollTop
                    : null;
                  selectConversation(conversation.id, scrollTop);
                }}
                compactDisplay={compactDisplay}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    selectedConversationId: get(state, 'selectedConversationId'),
  };
};

const mapDispatchToProps = {
  selectConversation: selectConversationAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(ConversationList, { name: "ConversationList"}));
