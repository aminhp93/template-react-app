import * as Sentry from '@sentry/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { withRouter } from 'react-router-dom';
import { Button, notification } from 'antd';
import { debounce, filter, forEach, get } from 'lodash';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { convertToRaw, EditorState, } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import isSoftNewlineEvent from 'draft-js/lib/isSoftNewlineEvent';
import createEmojiPlugin from 'draft-js-emoji-plugin';
import createMentionPlugin from 'draft-js-mention-plugin';
import { SetS3Config } from 'config/s3';

import { ConversationType, MessageType, TConversation, TFile, TMessage, TUser } from 'types';
import { sendMessage, updateMessage } from 'reducers/messages';
import { searchUserInConversation, fetchUsersList } from 'reducers/users';
import { S3_BUCKET_PREFIX } from 'constants/common';
import { MAXIMUM_FILE_SIZE, MEDIA_TYPES, uploadFiles, uploadImages } from 'utils/media';
import { getUploadedImages } from 'utils/uploadMedia';
import { generateRandomState } from 'utils/random';
import { deserializeEditorState } from 'utils/messagingContent';
import { clearEditorContent } from 'utils/editor';
import ContentEnhancer, { getEntities } from 'utils/contentEnhancer';
import { removeFileFromS3AndStorage } from 'services/S3';

import { GiphySelect } from 'components/Giphy';
import ImageSelect from 'components/NewsFeed/ImageSelect';
import Gallery from 'components/NewsFeed/Gallery';
import FileSelect from 'components/FileSelect';
import ChannelMentionEntry from './ChannelMentionEntry';
import MarkdownGuide from './MarkdownGuide';
import {
  CHANNEL_MENTION,
  HERE_MENTION,
  emojiPositionSuggestions,
  GlobalStyleForEmojiSelect,
  mentionPositionSuggestions,
  StyledEmojiSelectBottomWrapper,
  StyledEmojiSelectWrapper,
  theme as EmojiTheme,
} from './EditorPluginHelpers';
import {ChannelMention} from './ChannelMention';

const MAXIMUM_NUMBER_OF_FILES = 5;
const CHANNEL_MENTION_TAG = '{{channel}}';

interface IProps {
  /**
   * Reference to currently authenticated user in the store
   */
  authUser?: any;

  /**
   * The message in editing mode
   */
  message?: TMessage;
  /**
   * Current conversation
   */
  conversation?: TConversation;

  /**
   * Whether we're using this composer to create or edit a message
   */
  isEditing: boolean;

  /**
   * Callback invoked to search for user in a conversation by term
   */
  searchUserInConversation: (params?: any) => Promise<any>;

  /**
   * Reference to currently selected conversation's id in store
   */
  selectedConversationId?: number;

  /**
   * Callback invoked when the user hits `Send` button
   */
  sendMessage?: (params?: any) => Promise<any>;

  /**
   * Callback invoked when the user clicks on the `Cancel` button in edit mode
   */
  onFinishEdit?: (params?: any) => Promise<any>;

  /**
   * Callback invoked when the user presses `Save` or hit enter while editing a message to
   * save their editted version
   */
  updateMessage: (id: number, data?: any) => Promise<any>;

  /**
   * Reference to list of current users in the store
   */
  users: TUser[];

  isThreadDetail: boolean;
  selectedThreadDetail: number;
  location: any;
  fetchUsersList: any;
}

interface IState {
  /**
   * State of the editor
   */
  editorState: any;

  /**
   * List of file selected from the file selector
   */
  // fileList: any;
  /**
   * List of filtered mentions
   */
  mentionSuggestions: any[];

  /**
   * Whether the channel mention modal should be shown to warn
   * user when he/she mentions a channel with a large number of members
   */
  showMentionWarning: boolean;

  /**
   * List of images uploaded to S3
   */
  uploadedImages: any[];

  /**
   * List of files uploaded to S3
   */
  uploadedFiles: any[];

  styledEmojiSelectBottomWrapper: boolean;
}

const contentEnhancer = new ContentEnhancer.Builder()
  .withMentionEnhancer()
  .build();

const getEnhancedContent = (stateContent) => {
  const entities = getEntities(stateContent);
  const content = stateContent.getCurrentContent().getPlainText();
  const { blocks, entityMap } = convertToRaw(stateContent.getCurrentContent());
  const enhanced = contentEnhancer.enhance(
    content,
    blocks,
    entityMap,
    entities
  );
  return enhanced;
};

class MessageComposer extends React.Component<IProps,IState> {
  static defaultProps = {
    isEditing: false,
    isThreadDetail: false,
  };

  editor: any;
  editorId: any;
  emojiPlugin: any;
  mentionPlugin: any;

  constructor(props) {
    super(props);

    const customPrefix = {
      public: S3_BUCKET_PREFIX.MESSAGE,
    };

    SetS3Config('public', customPrefix);

    this.state = {
      editorState: this.getInitialEditorState(),
      mentionSuggestions: [],
      showMentionWarning: false,
      uploadedFiles: [],
      uploadedImages: this.getInitialUploadImages(),
      styledEmojiSelectBottomWrapper: true,
    };

    this.emojiPlugin = createEmojiPlugin({
      useNativeArt: true,
      theme: EmojiTheme,
      positionSuggestions: emojiPositionSuggestions,
    });

    this.mentionPlugin = createMentionPlugin({
      mentionPrefix: '@',
      mentionTrigger: '@',
      entityMutability: 'IMMUTABLE',
      positionSuggestions: mentionPositionSuggestions,
    });
    this.editorId = generateRandomState();
    this.handleMentionSearchChange = debounce(this.handleMentionSearchChange, 400);
  }

  private getInitialUploadImages = (): any[] => {
    const { message, isEditing } = this.props;
    if (message && isEditing) {
      const { files } = message;
      return getUploadedImages(files || []);
    }
    return [];
  };
  /**
   * Build a list of suggestion items for mention plugin
   */
  private buildSuggestions = (users, term='') => {
    const { authUser, conversation, isThreadDetail } = this.props;
    const filtered = Object.values(users).filter(
      (u: TUser) =>
        conversation &&
        conversation.members.includes(u.id) &&
        u.id !== authUser.id
    );
    let suggestions: any = filtered.map((u: TUser) => ({
      id: u.id,
      name: u.fullName,
      avatar: u.profileImage,
      sessionShortName: u.sessionShortName,
    }));

    const hasChannelMention = CHANNEL_MENTION[0].name.includes(term)
    const hasHereMention = HERE_MENTION[0].name.includes(term)

    if (
      [ConversationType.Public, ConversationType.Private].includes(
        conversation.conversationType
      ) &&
      isThreadDetail === false
    ) {
        if (hasChannelMention && hasHereMention && suggestions.length < 4) {
          suggestions = [...suggestions, ...CHANNEL_MENTION, ...HERE_MENTION];
        } else if (hasChannelMention && !hasHereMention && suggestions.length < 5) {
          suggestions = [...suggestions, ...CHANNEL_MENTION];
        } else if (!hasChannelMention && hasHereMention && suggestions.length < 5) {
          suggestions = [...suggestions, ...HERE_MENTION];
        }
    }
    suggestions = suggestions.slice(0, 5)
    return suggestions;
  };

  private dispatchMessageSend = async () => {
    const enhanced = this.getEnhancedContent();
    const content = enhanced && enhanced.length !== 0 ? enhanced : undefined;

    const { isEditing, message, selectedConversationId, conversation } = this.props;
    // If there is a message props to this MesasgeComposer and the isEditing
    // prop is false, it means the composer is used inside a thread
    const parent = !isEditing && message ? message.id : undefined;
    const channel = selectedConversationId ? selectedConversationId : conversation.id;

    const data: TMessage = {
      channel,
      content,
      files: this.getFiles(),
      parent,
      id: generateRandomState(),
      type: MessageType.UserMessage,
    };

    this.props.sendMessage(data);
    this.resetEditorState();
  };

  getFiles = () => {
    const { uploadedFiles, uploadedImages } = this.state;
    const files = [];
    let processFile = [];
    if (uploadedFiles && uploadedFiles.length > 0) {
      processFile = uploadedFiles
    } else if (uploadedImages && uploadedImages.length > 0) {
      processFile = uploadedImages
    }
    forEach(processFile, (f) => {
      const fileExt = f.name && f.name.split('.').pop();
      const file: TFile = {
        fileKey: `${f.key}.${fileExt}`,
        fileType: f.type,
        index: f.index,
        name: f.name,
        size: f.size,
      };
      files.push(file);
    });
    return files
  }

  private dispatchUpdateMessage = async () => {
    const enhanced = this.getEnhancedContent();
    const content = enhanced && enhanced.length !== 0 ? enhanced : undefined;

    const { message } = this.props;

    const data: TMessage = {
      content,
      files: this.getFiles(),
      created: message.created,
      id: message.id
    };

    this.props.updateMessage(message.id, data);
    this.resetEditorState();
    this.props.onFinishEdit();
  };

  private getEnhancedContent = () => {
    const { editorState } = this.state;
    const enhanced = getEnhancedContent(editorState);
    return enhanced && enhanced.trim();
  };

  private handleEditorKeyCommand = (command) => {
    if (command === 'message-send') {
      if (!this.props.isEditing) {
        this.validateAndSubmit();
      } else {
        this.dispatchUpdateMessage();
      }
      return 'handled';
    }
    return 'not-handled';
  };

  private handleGifSubmit = ({ images }) => {
    const { conversation, message } = this.props;

    const files: TFile[] = [
      {
        fileKey: images.original.url,
        fileType: MEDIA_TYPES.GIF,
        width: Number(images.original_still.width),
        height: Number(images.original_still.height),
      },
    ];

    const parent = (message && message.id) || undefined;

    const data: TMessage = {
      files,
      parent,
      id: generateRandomState(),
      content: undefined,
      channel: conversation.id,
      type: MessageType.GifMessage,
    };

    this.props.sendMessage(data);
  };

  private handleMentionSearchChange = async ({ value }) => {
    const params = {
      term: value,
      channel: this.props.conversation.id,
    };
    const response = await this.props.searchUserInConversation(params);
    const { users } = response;
    this.setState({ 
      mentionSuggestions: this.buildSuggestions(users, value)
    })

  };

  /** ================================================================
   * Begin of the Message LEGACY FILE UPLOAD
   * =================================================================
   */

  /**
   * Callback invoked when the user selects one or more files to upload
   * NOTE: Deprecated soon
   */
  private handleFileSelect = (files) => {
    const { uploadedFiles } = this.state;
    if (uploadedFiles.length + files.length > 5) {
      notification.error({
        message: 'Upload Error',
        description: 'Cannot upload more than 5 files at a time',
        placement: 'bottomLeft',
        duration: 5,
      });
      return;
    }

    uploadFiles(
      files,
      this.storeUploadedFilesToState,
      this.handleProgressCallbackForFiles,
      this.handleGetResultForFiles,
      MAXIMUM_FILE_SIZE
    );
  };

  private storeUploadedFilesToState = (uploadedFile) => {
    this.setState(({ uploadedFiles }) => ({
      uploadedFiles: [...uploadedFiles, uploadedFile],
    }));
  };

  private handleProgressCallback = (file, key, progress) => {
    if (file.key === key) {
      return {
        ...file,
        loaded: Math.ceil((progress.loaded * 100) / progress.total),
      };
    }
    return file;
  };

  private handleProgressCallbackForFiles = (progress, key) => {
    const { uploadedFiles } = this.state;

    const nextUploadedFileState = uploadedFiles.map((file) =>
      this.handleProgressCallback(file, key, progress)
    );
    this.setState({ uploadedFiles: nextUploadedFileState });
  };

  private handleGetResultForFiles = (result, key) => {
    const { uploadedFiles } = this.state;
    const nextUploadedFileState = uploadedFiles.map((file) => {
      return this.handleGetResult(file, key, result.key);
    });
    this.setState({ uploadedFiles: nextUploadedFileState });
  };

  private handleGetResult = (file, key, nextKey) => {
    if (file.key === key) {
      return {
        ...file,
        file_key: nextKey,
        fileKey: nextKey,
      };
    }
    return file;
  };

  /**
   * Callback invoked when the user selects one or more images to upload
   * NOTE: Deprecated soon
   */
  private handleImageSelect = (files) => {
    const { uploadedImages } = this.state;
    if (uploadedImages.length + files.length > 5) {
      notification.error({
        message: 'Upload Error',
        description: 'Cannot upload more than 5 images at a time',
        placement: 'bottomLeft',
        duration: 5,
      });
      return;
    }
    uploadImages(
      files,
      this.storeUploadedImagesToState,
      this.handleProgressCallbackForImages,
      this.handleGetResultForImages
    );
  };

  private storeUploadedImagesToState = (uploadedImage) => {
    this.setState(({ uploadedImages }) => ({
      uploadedImages: [...uploadedImages, uploadedImage],
    }));
  };

  private handleProgressCallbackForImages = (progress, key) => {
    const { uploadedImages } = this.state;
    const nextUploadedImageState = uploadedImages.map((file) => {
      return this.handleProgressCallback(file, key, progress);
    });
    this.setState({ uploadedImages: nextUploadedImageState });
  };

  private handleGetResultForImages = (result, key) => {
    const { uploadedImages } = this.state;
    const nextUploadedImageState = uploadedImages.map((file) =>
      this.handleGetResult(file, key, result.key)
    );
    this.setState({ uploadedImages: nextUploadedImageState });
  };

  private resetEditorState = () => {
    this.setState({
      editorState: clearEditorContent(this.state.editorState),
      uploadedFiles: [],
      uploadedImages: [],
      showMentionWarning: false,
    });
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

  private getInitialEditorState = () => {

    const { isEditing, message } = this.props;
    if (isEditing) {
      return deserializeEditorState(message.content, message);
    }
    
    const params = new URL(window.location.href).searchParams;
    const id = params.get('user_id');
    if (id) {
      const defaultMessage = {
        content: `{{${id}}}`,
        mentions: [id]
      }
      return deserializeEditorState(defaultMessage.content, defaultMessage);
    } else {
      return EditorState.createEmpty();
    }
    
  };

  private shouldDisableGif = () => {
    const { uploadedFiles, uploadedImages } = this.state;
    return uploadedFiles.length > 0 || uploadedImages.length > 0;
  };

  private isContentReady = (): boolean => {
    // Check whether the message composer has any ready content
    // Ready content is defined as:
    // - If the message only contain text => text must not be empty
    // - If the message has images => All images are successfully uploaded
    // - If the message has files => All files are successfully uploaded
    const content = this.getEnhancedContent();
    const { uploadedImages, uploadedFiles } = this.state;

    // Check if all images are ready
    const isAllImagesReady =
      uploadedImages.length !== 0 &&
      !uploadedImages.find((image) => !image.fileKey);
    const isAllFilesReady =
      uploadedFiles.length !== 0 &&
      !uploadedFiles.find((file) => !file.fileKey);

    let isReady = true;
    if (uploadedFiles.length !== 0) {
      isReady = isAllFilesReady;
    } else if (uploadedImages.length !== 0) {
      isReady = isAllImagesReady;
    } else {
      isReady = content.length !== 0;
    }

    return isReady;
  };

  private removeImage = (key) => {
    this.setState(({ uploadedImages }) => {
      const nextUploadedImages = filter(
        uploadedImages,
        (image) => image.key !== key
      );
      const removedFile = uploadedImages.find((file) => file.key === key);

      removeFileFromS3AndStorage({
        ...removedFile,
        file_prefix: S3_BUCKET_PREFIX.MESSAGE,
      });
      return {
        uploadedImages: nextUploadedImages,
      };
    });
  };

  private removeFile = (key) => {
    this.setState(({ uploadedFiles }) => {
      const nextUploadFiles = filter(
        uploadedFiles,
        (image) => image.key !== key
      );
      const removedFile = uploadedFiles.find((file) => file.key === key);

      removeFileFromS3AndStorage({
        ...removedFile,
        file_prefix: S3_BUCKET_PREFIX.MESSAGE,
      });
      return {
        uploadedFiles: nextUploadFiles,
      };
    });
  };

  componentDidUpdate(prevProps) {
    const setStateObj:any = {};
    if (
      this.props.isThreadDetail &&
      this.props.selectedThreadDetail &&
      prevProps.selectedThreadDetail !== this.props.selectedThreadDetail
    ) {
      setStateObj.editorState = clearEditorContent(this.state.editorState);
    }
    
    if (
      this.props.selectedConversationId &&
      this.props.selectedConversationId !== prevProps.selectedConversationId
    ) {
      const mentionSuggestions = this.buildSuggestions(this.props.users);
      setStateObj.mentionSuggestions = mentionSuggestions;
      setStateObj.editorState = EditorState.createEmpty();
    }
    const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
    const { styledEmojiSelectBottomWrapper } = this.state;
    if (rect.top <= 410) {
      if (styledEmojiSelectBottomWrapper) {
        setStateObj.styledEmojiSelectBottomWrapper = false;
      }
    } else {
      if (!styledEmojiSelectBottomWrapper) {
        setStateObj.styledEmojiSelectBottomWrapper = true;
      }
    }
    if (JSON.stringify(setStateObj) !== '{}') {
      this.setState(setStateObj)
    }
  }

  private validateAndSubmit = () => {
    const { conversation } = this.props;
    const enhanced = this.getEnhancedContent();

    if (!this.isContentReady()) return
    
    if (
      conversation &&
      conversation.members &&
      conversation.members.length > 5 &&
      enhanced.includes(CHANNEL_MENTION_TAG)
    ) {
      this.setState({ showMentionWarning: true });
    } else {
      this.dispatchMessageSend();
    }
  };

  async componentDidMount() {
    const { users } = this.props;
    const mentionSuggestions = this.buildSuggestions(users);
    const setStateObj: any = {
      mentionSuggestions
    }

    const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
    const { styledEmojiSelectBottomWrapper } = this.state;
    if (rect.top <= 410) {
      if (styledEmojiSelectBottomWrapper) {
        setStateObj.styledEmojiSelectBottomWrapper = false;
      }
    } else {
      if (!styledEmojiSelectBottomWrapper) {
        setStateObj.styledEmojiSelectBottomWrapper = true;
      }
    }

    const params = new URL(window.location.href).searchParams;
    const id = params.get('user_id');
    if (id) {
      await this.props.fetchUsersList({ ids: [Number(id)] });
      const defaultMessage = {
        content: `{{${id}}}`,
        mentions: [Number(id)]
      }
      setStateObj.editorState = deserializeEditorState(defaultMessage.content, defaultMessage);
    }
    this.setState(setStateObj);
  }

  public render(): JSX.Element {
    // console.log('MessageComposer')
    const { conversation, isEditing } = this.props;
    const {
      editorState,
      mentionSuggestions,
      uploadedFiles,
      uploadedImages,
      showMentionWarning,
      styledEmojiSelectBottomWrapper,
    } = this.state;
    const { EmojiSuggestions, EmojiSelect } = this.emojiPlugin;
    const { MentionSuggestions } = this.mentionPlugin;
    const plugins = [this.mentionPlugin, this.emojiPlugin];

    const gifDisabled = this.shouldDisableGif();
    const imageButtonDisabled = uploadedFiles.length > 0;
    const fileButtonDisabled = uploadedImages.length > 0;

    const sendButtonDisabled = !this.isContentReady();
    return (
      <>
        <div className="m-message-composer message-textarea w-100">
          <div className="mx-3 my-1 border rounded m-message-editor__container">
            <Editor
              editorState={editorState}
              plugins={plugins}
              handleKeyCommand={this.handleEditorKeyCommand}
              keyBindingFn={this.sendMessageKeyBindingFunc}
              onChange={editorState => this.setState({ editorState })}
              placeholder="Type a message"
              ref={(element) => (this.editor = element)}
              spellCheck
            />
          </div>
          {uploadedImages.length > 0 && (
            <Gallery
              files={uploadedImages}
              onAddMore={this.handleImageSelect}
              remove={this.removeImage}
              onOrdered={uploadedImages => this.setState({ uploadedImages })}
              maximumNumOfFiles={MAXIMUM_NUMBER_OF_FILES}
            />
          )}
          {uploadedFiles.length > 0 && (
            <Gallery
              files={uploadedFiles}
              onAddMore={this.handleFileSelect}
              remove={this.removeFile}
              maximumNumOfFiles={MAXIMUM_NUMBER_OF_FILES}
            />
          )}
          <div className="py-1 px-3 mb-1 flex m-message-compose__actions">
            <div className="m-message-compose__plugins">
              <GlobalStyleForEmojiSelect />
              {styledEmojiSelectBottomWrapper && (
                <StyledEmojiSelectBottomWrapper>
                  <EmojiSelect />
                </StyledEmojiSelectBottomWrapper>
              )}
              {!styledEmojiSelectBottomWrapper && (
                <StyledEmojiSelectWrapper>
                  <EmojiSelect />
                </StyledEmojiSelectWrapper>
              )}
              <EmojiSuggestions />
              
              <div className={imageButtonDisabled? 'm-message-composer__disabled' : ''}>
                <ImageSelect onSelect={this.handleImageSelect} />
              </div>
              
              {!isEditing && (
                <>
                  <div className={gifDisabled ? 'm-message-composer__disabled' : ''}>
                    <GiphySelect onSelect={this.handleGifSubmit} />
                  </div>
                  <div className={fileButtonDisabled ? 'm-message-composer__disabled' : ''}>
                    <FileSelect onSelect={this.handleFileSelect} />
                  </div>
                </>
              )}

              {conversation.conversationType !==
                ConversationType.DirectMessage && (
                <MentionSuggestions
                  onSearchChange={this.handleMentionSearchChange}
                  suggestions={mentionSuggestions}
                  entryComponent={ChannelMentionEntry}
                />
              )}
            </div>
            <div className="m-message-compose__buttons">
              <MarkdownGuide />
              {isEditing ? (
                <>
                  <Button type="default" onClick={this.props.onFinishEdit}>
                    Cancel
                  </Button>
                  <Button
                    className="m-message-composer__submit-button submit-button"
                    disabled={sendButtonDisabled}
                    type="primary"
                    onClick={this.dispatchUpdateMessage}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  className="m-message-composer__submit-button submit-button"
                  disabled={sendButtonDisabled}
                  type="primary"
                  onClick={this.validateAndSubmit}
                >
                  Send
                </Button>
              )}
            </div>
          </div>
        </div>

        {conversation && showMentionWarning && (
          <ChannelMention
            isOpen={showMentionWarning}
            onClose={() => this.setState({ showMentionWarning: false })}
            onConfirm={this.dispatchMessageSend}
            numOfMembers={conversation.members.length}
          />
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  const authUser = get(state, 'authUser') || {};
  const selectedConversationId = get(state, 'selectedConversationId');
  const users = get(state, 'users') || [];
  const selectedThreadDetail = get(state, 'selectedThreadDetail');

  return { authUser, selectedConversationId, users, selectedThreadDetail };
};

const mapDispatchToProps = {
  searchUserInConversation,
  sendMessage,
  updateMessage,
  fetchUsersList
};

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(Sentry.withProfiler(MessageComposer, { name: "MessageComposer"}));
