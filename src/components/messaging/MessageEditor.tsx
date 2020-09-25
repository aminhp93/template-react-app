import * as Sentry from '@sentry/react';
import React from 'react';
import { connect } from 'react-redux';
import { debounce, get } from 'lodash';
import Editor from 'draft-js-plugins-editor';
import isSoftNewlineEvent from 'draft-js/lib/isSoftNewlineEvent';
import createMentionPlugin, {
  defaultSuggestionsFilter,
} from 'draft-js-mention-plugin';
import createEmojiPlugin from 'draft-js-emoji-plugin';

import { ConversationType, TUser } from 'types';
import { searchUserInConversation as searchUserInConversationAction } from 'reducers/users';

import ChannelMentionEntry from './ChannelMentionEntry';
import {
  CHANNEL_MENTION,
  emojiPositionSuggestions,
  mentionPositionSuggestions,
} from './EditorPluginHelpers';


interface IMessageEditorProps {
  /**
   * Reference to currently authenticated user in the store
   */
  authUser?: any;

  /**
   * Reference to current conversation as idenfied by the `conversations` and
   * `selectedConversationId` in the store
   */
  conversation?: any;

  /**
   * The state of the DraftJS editor
   */
  editorState: any;

  /**
   * The emoji plugin for the editor
   */
  emojiPlugin: any;

  /**
   * The mention plugin for the editor
   */
  mentionPlugin: any;

  /**
   * Whether the editor is in editing mode (default is not, which is creating mode)
   */
  isEditing: boolean;

  inspectEmojiPlugin: (params?: any) => void;

  /**
   * Callback invoked when the editorState is changed
   */
  onChange: (params?: any) => void;

  /**
   * Callback invoked to search for users in current conversation by some criteria,
   * Used to get users data for mention plugin
   */
  searchUserInConversation: (params?: any) => Promise<any>;

  /**
   * Callback invoked when the `message-send` command is issued (i.e., when the user
   * types `Enter`)
   */
  sendMessage: (params?: any) => Promise<any>;

  /**
   * Callback invoked when the `message-send` command is issued in editing mode
   * (i.e., when the user types `Enter`)
   */
  updateMessage: (params?: any) => Promise<any>;

  /**
   * Reference to current list of users in the store
   */
  users?: any;
}

export class MessageEditor extends React.Component<IMessageEditorProps> {
  emojiPlugin: any;
  mentionPlugin: any;

  state = {
    data: [],
    suggestions: [],
  };

  constructor(props) {
    super(props);
    this.mentionPlugin = this.createMentionPlugin();
    this.emojiPlugin = this.createEmojiPlugin();
    this.fetchUsers = debounce(this.fetchUsers, 400);
  }

  private createMentionPlugin = () => {
    return createMentionPlugin({
      mentionPrefix: '@',
      mentionTrigger: '@',
      // supportWhitespace: true,
      entityMutability: 'IMMUTABLE',
      positionSuggestions: mentionPositionSuggestions,
    });
  };

  private createEmojiPlugin = () => {
    return createEmojiPlugin({
      useNativeArt: true,
      positionSuggestions: emojiPositionSuggestions,
    });
  };

  private buildSuggestions = (users) => {
    const { conversation, authUser } = this.props;
    const filtered = Object.values(users).filter(
      (u: TUser) => conversation.members.includes(u.id) && u.id !== authUser.id
    );
    let suggestions = filtered.map((u: TUser) => ({
      id: u.id,
      name: u.fullName,
      avatar: u.profileImage,
    }));

    if (
      [ConversationType.Public, ConversationType.Private].indexOf(
        conversation.conversationType
      ) > -1
    ) {
      suggestions = [...suggestions, ...CHANNEL_MENTION];
    }

    return suggestions;
  };

  private fetchUsers = async (term) => {
    const params = {
      term,
      channel: this.props.conversation.id,
    };
    const response = await this.props.searchUserInConversation(params);
    const { users } = response;

    let data = this.buildSuggestions(users);
    if (data && data.length > 5) {
      data = data.slice(0, 5);
    }
    this.setState({ data, suggestions: data });
  };

  private handleKeyCommand = (command) => {
    if (command === 'message-send') {
      if (this.props.isEditing) {
        this.props.updateMessage();
      } else {
        this.props.sendMessage();
      }
      return 'handled';
    }

    return 'not-handled';
  };

  private onSearchChange = async ({ value }) => {
    await this.fetchUsers(value);
    const suggestions = defaultSuggestionsFilter(value, this.state.data);
    this.setState({ suggestions });
  };

  /**
   * Provide a custom key binding function for the Editor
   * so `Enter` will trigger `message-send` instead of the detault
   * `split-block`
   */
  private sendMessageKeyBindingFunc = (e) => {
    if (e.keyCode === 13 && !isSoftNewlineEvent(e)) {
      return 'message-send';
    }
  };

  public componentDidMount = () => {
    const { users } = this.props;
    const suggestions = this.buildSuggestions(users);
    this.setState({ data: suggestions, suggestions });
  };

  public render(): JSX.Element {
    const { editorState } = this.props;
    const { suggestions } = this.state;
    const { MentionSuggestions } = this.mentionPlugin;
    const plugins = [this.emojiPlugin, this.mentionPlugin];

    return (
      <>
        <Editor
          editorState={editorState}
          plugins={plugins}
          handleKeyCommand={this.handleKeyCommand}
          keyBindingFn={this.sendMessageKeyBindingFunc}
          onChange={this.props.onChange}
          placeholder="Type a message"
          spellCheck
        />

        <MentionSuggestions
          onSearchChange={this.onSearchChange}
          suggestions={suggestions}
          entryComponent={ChannelMentionEntry}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => {
  const users = get(state, 'users') || [];
  const authUser = get(state, 'authUser') || {};
  const conversations = get(state, 'conversations') || [];
  const selectedConversationId = get(state, 'selectedConversationId');

  const conversation = conversations[selectedConversationId];

  return { authUser, users, conversation };
};

const mapDispatchToProps = {
  searchUserInConversation: searchUserInConversationAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(MessageEditor, { name: "MessageEditor"}));
