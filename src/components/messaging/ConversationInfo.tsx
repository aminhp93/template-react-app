import * as Sentry from '@sentry/react';
import * as React from 'react';
import { Collapse } from 'antd';
import { connect } from 'react-redux';
import { get } from 'lodash';

import config from 'config';
import { CHAT_PATH } from 'constants/common';
import { ConversationType, EditChannelType } from 'types';
import { formatDate } from 'utils/time';
import LoadingIndicator from 'components/LoadingIndicator';
import PinnedMessageItem from './PinnedMessageItem';
import EditChannelNameWrapper from './EditChannelNameWrapper';
import EditChannelPurposeWrapper from './EditChannelPurposeWrapper';
import { fetchMessageList } from 'reducers/messages';
import { mapPinnedMessages } from './utils';
import { updateSecondaryView } from 'reducers/views';

const { Panel } = Collapse;

type IProps = {
  selectedConversation: any;
  authUser: any;
  users: any;
  fetchMessageList: any;
  messages: any;
  updateSecondaryView: any;
  team: any;
};


class ConversationInfo extends React.PureComponent<IProps> {
  next = '';
  smallestPinnedAtMessage = '';

  state = {
    modal: null,
    hasMore: true,
    loading: false,
  };

  isChannelAdmin = () => {
    const { selectedConversation, authUser } = this.props;
    return get(selectedConversation, 'admins', []).includes(authUser.id);
  };

  handleEditChannel = (index) => {
    this.setState({
      modal: index,
    });
  };

  handleFetchPinnedMessages = async () => {
    try {
      if (!this.state.hasMore) return;
      this.setState({ loading: true });
      const response = await this.props.fetchMessageList(
        { isPinned: true },
        this.next
      );
      const hasMore = !!response.data.next;
      this.next = response.data.next;
      this.setState({
        loading: false,
        hasMore,
      });
    } catch (error) {
      this.setState({ loading: false });
    }
  };

  handleActivePanel = (key) => {
    if (key === '2') {
      this.smallestPinnedAtMessage = '';
      this.handleFetchPinnedMessages();
    }
  };

  getConversationUrl = (): string => {
    const base = config.appUrl;
    const { selectedConversation, team } = this.props;
    const { slug } = selectedConversation;
    let teamSlug = '';
    if (selectedConversation.team) {
      teamSlug = team.name + '/';
    }
    return `${base}${CHAT_PATH}/${teamSlug}${slug}`;
  };

  render() {
    const {
      selectedConversation,
      updateSecondaryView,
      users,
      messages,
      authUser
    } = this.props;
    const { modal, loading } = this.state;
    if (!selectedConversation.id) return null;

    const channelName = selectedConversation.conversationName;
    const created = selectedConversation.created || '';
    const creatorName =
          (users[selectedConversation.creator] || {}).fullName || 'Unknown User';
    const purpose = selectedConversation.purpose;
    const conversationType = selectedConversation.conversationType;
    const pinnedMessages = mapPinnedMessages(messages, selectedConversation.id);

    const isGroup = conversationType === ConversationType.Group;
    const isDMG = conversationType === ConversationType.DirectMessage;
    const inPreviewMode = !(selectedConversation.members || []).includes(
      authUser.id
    );
    return (
      <div className="conversation-info">
        <div className="title header-container medium font-weight-bold">
          <div>About this {isGroup ? 'group' : (isDMG ? 'conversation' : 'channel')}</div>
          <div onClick={() => updateSecondaryView(null)}>
            <i className="fa fa-times" />
          </div>
        </div>
        <div style={{ height: 'calc(100vh - 130px)', overflowY: 'scroll' }}>
          <Collapse onChange={this.handleActivePanel} accordion>
            <Panel
              showArrow={false}
              header={isGroup ? 'Group details' : (isDMG ? 'Conversation details': 'Channel details')}
              key="1"
              extra={
                <>
                  <i className="fa fa-caret-up" />
                  <i className="fa fa-caret-down" />
                </>
              }
            >
              <div className="channel-details">
                <div className="row">
                  <div className="title">
                    <div className="title-content font-weight-bold">Name</div>
                    {
                      !inPreviewMode && !isDMG && !selectedConversation.isArchived
                        ? (
                          <div
                            className="link"
                            onClick={() =>
                              this.handleEditChannel(EditChannelType.Name)
                            }
                          >
                            Edit
                          </div>
                        )
                        : null
                    }
                  </div>
                  <div className="row-content">{channelName}</div>
                </div>
                <div className="row">
                  <div className="title-content font-weight-bold">Created</div>
                  <div className="row-content">
                    {`Created by ${creatorName} on ${formatDate(
                      created.slice(0, 10),
                      'YYYY-MM-DD',
                      'MMM DD, YYYY'
                    )}`}
                  </div>
                </div>
                {[ConversationType.Public, ConversationType.Private].includes(
                  conversationType
                ) ? (
                  <div className="row">
                    <div className="title">
                      <div className="title-content font-weight-bold">
                        Purpose
                      </div>
                      {
                        !inPreviewMode && !selectedConversation.isArchived
                          ? (
                            <div
                              className="link"
                              onClick={() =>
                                this.handleEditChannel(EditChannelType.Purpose)
                              }
                            >
                              Edit
                            </div>
                          )
                          : null
                      }
                    </div>
                    <div className="row-content">{purpose}</div>
                  </div>
                ) : null}
                <div>
                  <div className="title-content font-weight-bold">URL</div>
                  <div className="link row-content">
                    <a href={this.getConversationUrl()} target="_blank" rel="noreferrer">
                      {this.getConversationUrl()}
                    </a>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel
              showArrow={false}
              header="Pinned items"
              key="2"
              extra={
                <>
                  <i className="fa fa-caret-up" />
                  <i className="fa fa-caret-down" />
                </>
              }
            >
              <div className="pinned-messages pt-3">
                {loading ? (
                  <LoadingIndicator />
                ) : pinnedMessages.length === 0 ? (
                  <div className="text-center">
                    No items have been pinned yet!
                  </div>
                ) : (
                  pinnedMessages.map((message) => (
                    <PinnedMessageItem key={message.id} message={message} inPreviewMode={inPreviewMode} isArchived={selectedConversation.isArchived} />
                  ))
                )}
                {this.state.hasMore && (
                  <div className="text-center">
                    <button
                      className="btn btn-link mt-2 text-primary"
                      onClick={() => this.handleFetchPinnedMessages()}
                    >
                      Show more...
                    </button>
                  </div>
                )}
              </div>
            </Panel>
          </Collapse>
        </div>
        {modal === EditChannelType.Name && (
          <EditChannelNameWrapper
            onModalClose={() => this.setState({ modal: null })}
          />
        )}
        {modal === EditChannelType.Purpose && (
          <EditChannelPurposeWrapper
            onModalClose={() => this.setState({ modal: null })}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const conversations = get(state, 'conversations') || {};
  const selectedConversationId = get(state, 'selectedConversationId');
  const teams = get(state, 'teams');
  const selectedTeamId = get(state, 'selectedTeamId');
  const team = teams[selectedTeamId];

  return {
    selectedConversationId,
    selectedConversation: conversations[selectedConversationId] || {},
    authUser: get(state, 'authUser') || {},
    users: get(state, 'users') || {},
    messages: get(state, 'messages') || {},
    team,
  };
};

const mapDispatchToProps = {
  fetchMessageList,
  updateSecondaryView,
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(ConversationInfo, { name: "ConversationInfo"}));
