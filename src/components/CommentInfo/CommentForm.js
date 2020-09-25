import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import Dropzone from 'react-dropzone';
import {
  convertToRaw,
  EditorState,
} from 'draft-js';
import Editor from 'draft-js-plugins-editor';

import createEmojiPlugin from 'draft-js-emoji-plugin';
import createMentionPlugin from 'draft-js-mention-plugin';
import get from 'lodash/get';
import deepEqual from 'deep-equal';
import { withRouter } from 'react-router-dom';

// import pusherInstance from 'services/Pusher';
import PusherService from 'services/Pusher';
import CommentService from 'services/Comment';
import MentioningUserService from 'services/MentioningUser';
import Gallery from 'components/NewsFeed/Gallery';
import {
  getUploadedImages,
  IMAGE_TYPES,
  MEDIA_TYPES,
  removeImage,
  selectGif,
  uploadImages,
} from 'utils/media';
import emitter, { EVENT_KEYS } from 'utils/event';
import { formatMentionedUser, getEntities } from 'utils/contentEnhancer';
import { AttachmentTypes, S3_BUCKET_PREFIX } from 'constants/common';
import ImageSelect from 'components/NewsFeed/ImageSelect';
import { GiphySelect } from 'components/Giphy';
import { SetS3Config } from 'config/s3';
import GifInEditor from 'components/NewsFeed/Media/GifInEditor';
import { removeFileFromS3AndStorage } from 'services/S3';
import RoutePreventLeaving from 'components/RoutePreventLeaving';
import Discard from 'components/Modals/Discard';
import { getInitialState } from 'utils/content';
import ChannelMentionEntry from 'components/messaging/ChannelMentionEntry';

const emojiPlugin = createEmojiPlugin();
const { EmojiSuggestions, EmojiSelect } = emojiPlugin;

const mentionPlugin = createMentionPlugin({
  mentionPrefix: '@',
  entityMutability: 'IMMUTABLE',
  supportWhitespace: true,
});
const { MentionSuggestions } = mentionPlugin;

const plugins = [emojiPlugin, mentionPlugin];

const logger = new Logger('pages/newsfeed');

const defaultState = {
  data: {
    commentContent: EditorState.createEmpty(),
  },
  buttonDisabled: true,
  suggestions: [],
  uploadedImage: null,
  uploadedImageOriginal: null,
  shouldShowDiscardPopup: false,
  selectedGif: null,
  loadingGif: false,
  gifURL: null,
  contentContainsLink: false,
};

class CommentForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.isEditing() ? this.initState() : defaultState;
    const customPrefix = {
      public: S3_BUCKET_PREFIX.COMMENT,
    };
    SetS3Config('public', customPrefix);
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.handleLeavePage);
  }

  componentWillUnmount() {
    const { uploadedImage } = this.state;

    if (uploadedImage && !this.isEditing()) {
      removeFileFromS3AndStorage({ ...uploadedImage, file_prefix: S3_BUCKET_PREFIX.COMMENT });
    }
    window.removeEventListener('beforeunload', this.handleLeavePage);
  }

  onChange = (editorState) => {
    const { uploadedImage, selectedGif } = this.state;
    const buttonDisabled = !(editorState.getCurrentContent().getPlainText().length) && !uploadedImage && !selectedGif;

    if (this.isEditing()) {
      this.setState({ content: editorState, buttonDisabled });
      return;
    }
    const data = { ...this.state.data, commentContent: editorState };

    this.setState({ data, buttonDisabled });
  };

  onSearchChange = ({ value }) => {
    MentioningUserService
      .searchUser(value)
      .then((res) => {
        this.setState({
          suggestions: res.data,
        });
      })
      .catch(((error) => {
        logger.error(error);
      }));
  };

  didContentChange = () => {
    const { data: { commentContent: original }, content } = this.state;
    return content && original.getCurrentContent().getPlainText() !== content.getCurrentContent().getPlainText();
  };

  didUploadedImagesChange = () => {
    const { uploadedImageOriginal, uploadedImage } = this.state;
    return !deepEqual(uploadedImageOriginal, uploadedImage);
  };

  didSelectedGifChange = () => {
    const { selectedGifOriginal, selectedGif } = this.state;
    return !deepEqual(selectedGifOriginal, selectedGif);
  };

  didPostChange = () => {
    const contentChanged = this.didContentChange();
    const uploadedImagesChanged = this.didUploadedImagesChange();
    const selectedGifChanged = this.didSelectedGifChange();

    return contentChanged || uploadedImagesChanged || selectedGifChanged;
  };

  isEditing = () => {
    const { comment } = this.props;

    return !!comment;
  };

  initState = () => {
    const { comment } = this.props;
    const initialState = getInitialState(comment);
    const state = {
      ...defaultState,
      ...initialState,
      data: {
        commentContent: initialState.contentOriginal,
      },
    };
    let uploadedImages = [];

    if (!initialState.hasGifAttachment) {
      uploadedImages = getUploadedImages(comment.files);
    }

    return {
      ...state,
      uploadedImages,
    };
  };

  handleLeavePage = (e) => {
    const { uploadedImage, content } = this.state;

    if ((content && content.getCurrentContent().getPlainText().length > 0) || uploadedImage) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  handleChange = (event) => {
    const data = { ...this.state.data, commentContent: event.target.value };
    const buttonDisabled = !(data.commentContent.length);
    this.setState({ data, buttonDisabled });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const {
      postId, action, commentId, modelType, appLabel, triggerShowCommentList, onCancel,
    } = this.props;
    let body = {};
    PusherService.instance.currentIndex = postId;
    const {
      data: { commentContent }, uploadedImage, selectedGif, uploadedImageOriginal, content,
    } = this.state;
    let requestedContent = commentContent;

    if (this.isEditing()) {
      requestedContent = content;
    }
    const entities = getEntities(requestedContent);
    const { blocks, entityMap } = convertToRaw(requestedContent.getCurrentContent());
    let plainContent = requestedContent.getCurrentContent().getPlainText();
    let files = [];

    if (uploadedImage) {
      files = [{
        file_key: uploadedImage.file_key,
        file_type: uploadedImage.type,
        file_prefix: S3_BUCKET_PREFIX.COMMENT,
      }];
    }
    if (selectedGif) {
      files = [{
        file_key: get(selectedGif, 'images.original.url'),
        file_sub_key: get(selectedGif, 'images.original_still.url'),
        file_type: MEDIA_TYPES.GIF,
      }];
    }

    plainContent = formatMentionedUser(plainContent, blocks, entityMap, entities);
    if (action && action === 'replyComment') {
      body = {
        model: 'comment',
        app_label: 'comments',
        eid: commentId,
        content: plainContent,
        files,
      };
    } else {
      body = {
        model: modelType,
        app_label: appLabel,
        eid: postId,
        content: plainContent,
        files,
      };
    }

    if (this.isEditing()) {
      body = {
        content: plainContent,
        files,
        model: 'comment',
        app_label: 'comments',
      };
    }
    if (appLabel === 'newsfeed') {
      emitter.emit(EVENT_KEYS.COMMENT_NEWS_FEED_POST);
    }
    const submit = this.isEditing()
      ? CommentService.editComment(commentId, body)
      : CommentService.postComment(body);

    submit.then((res) => {
      const data = { commentContent: EditorState.createEmpty() };

      if (this.isEditing() && this.didUploadedImagesChange() && uploadedImageOriginal) {
        removeImage([uploadedImageOriginal], requestedContent, uploadedImageOriginal.key, this.isEditing());
      }
      this.setState({
        data,
        uploadedImage: null,
        selectedGif: null,
        gifURL: null,
        content: null,
      }, () => {
        if (appLabel === 'newsfeed') {
          emitter.emit(EVENT_KEYS.COMMENT_NEWS_FEED_POST);
        }
      });
      if (triggerShowCommentList) {
        triggerShowCommentList(res.data);
      }
      onCancel(res.data)();
    }).catch((error) => {
      logger.error(error);
    });
  };

  handleDownloadingFinish = (url) => {
    this.setState({ loadingGif: false, gifURL: url, buttonDisabled: false });
  };

  handleGifSelect = (selectedGif) => {
    this.setState({ selectedGif, loadingGif: true });
    selectGif(selectedGif, this.handleDownloadingFinish);
  };

  handleProgressCallback = (progress) => {
    const { uploadedImage } = this.state;

    this.setState({
      uploadedImage: {
        ...uploadedImage,
        loaded: Math.ceil((progress.loaded * 100) / progress.total),
      },
    });
  };

  handleGetResult = (result) => {
    const { uploadedImage } = this.state;

    this.setState({
      uploadedImage: {
        ...uploadedImage,
        file_key: result.key,
      },
      buttonDisabled: false,
    });
  };

  handleCancel = () => {
    const { onCancel } = this.props;

    onCancel()();
  };

  handleCancelEditingMode = (e) => {
    e.preventDefault();
    if (this.didPostChange()) {
      this.showDiscardPopup();
    } else {
      this.handleCancel();
    }
  };

  handleConfirmDiscard = () => {
    this.handleCancel();
    this.initState();
  };

  showDiscardPopup = () => {
    this.setState({ shouldShowDiscardPopup: true });
  };

  hideDiscardPopup = () => {
    this.setState({ shouldShowDiscardPopup: false });
  };

  storeUploadedImagesToState = (uploadedImage) => {
    this.setState({ uploadedImage });
    if (uploadedImage.errorType) {
      this.setState({
        buttonDisabled: true,
      });
    }
  };

  uploadImages = (files) => {
    uploadImages(
      files,
      this.storeUploadedImagesToState,
      this.handleProgressCallback,
      this.handleGetResult,
    );
  };

  shouldDisableButton = (attachmentType) => {
    const { uploadedImage, selectedGif } = this.state;

    if (uploadedImage && attachmentType === AttachmentTypes.FILE) return true;
    if (!uploadedImage && attachmentType === AttachmentTypes.GIF) return false;

    return !(!selectedGif && attachmentType === AttachmentTypes.FILE);
  };

  removeImage = (key) => {
    const { uploadedImage, data, content } = this.state;
    const isEditing = this.isEditing();
    const removedData = removeImage([uploadedImage], isEditing ? content : data.commentContent, key, isEditing);

    this.setState({ uploadedImage: null, buttonDisabled: removedData.buttonDisabled });
  };

  removeGif = () => {
    const { uploadedImage, content } = this.state;

    this.setState({ selectedGif: null });
    if (content.getCurrentContent().getPlainText().length === 0 && !uploadedImage) {
      this.setState({ buttonDisabled: true });
    }
  };

  render() {
    const {
      suggestions, uploadedImage, selectedGif, loadingGif, gifURL, shouldShowDiscardPopup,
      content, data, buttonDisabled,
    } = this.state;
    const { history } = this.props;
    const isEditing = this.isEditing();
    const isUploading = uploadedImage && !uploadedImage.file_key;

    return (
      <div className="form-group post-comment-form">
        <form className="post-comment-padding">
          {/* {this.state.buttonDisabled ? <span style={{ color: 'grey', zIndex: 0, position: 'absolute' }}>Enter your comment here</span> : null} */}
          <Dropzone
            onDrop={this.uploadImages}
            accept={IMAGE_TYPES}
            multiple={false}
          >
            {({ getRootProps, isDragActive }) => (
              <div {...getRootProps()} className={clsx({ 'post-box__dropzone--isActive ': isDragActive })}>
                <Editor
                  editorState={content || data.commentContent}
                // handleKeyCommand={this.handleKeyCommand}
                  plugins={plugins}
                  onChange={this.onChange}
                  ref={(element) => { this.editor = element; }}
                  placeholder="Enter your comment here"
                />
                <EmojiSuggestions />
                <MentionSuggestions
                  onSearchChange={this.onSearchChange}
                  suggestions={suggestions}
                  entryComponent={ChannelMentionEntry}
                  onAddMention={this.onAddMention}
                />
                { uploadedImage
                  && (
                  <Gallery
                    files={[uploadedImage]}
                    remove={this.removeImage}
                    onOrdered={this.handleOnOrdered}
                    size="medium"
                    imageOnly
                  />
                  )}
                { isDragActive && <p className="post-box__dropzone__drop_images"><span>Drop images here...</span></p>}
              </div>
            )}
          </Dropzone>
          {
            selectedGif && (
              <GifInEditor
                removeGif={this.removeGif}
                selectedGif={selectedGif}
                loadingGif={loadingGif}
                gifURL={gifURL}
              />
            )
          }
          <div className="commands">
            <div className="left-side action-group">
              <EmojiSelect />
              <div className={clsx({ 'action-group__item--disable': this.shouldDisableButton(AttachmentTypes.FILE) })}>
                <ImageSelect multiple={false} onSelect={this.uploadImages} />
              </div>
              <div className={clsx({ 'action-group__item--disable': this.shouldDisableButton(AttachmentTypes.GIF) })}>
                <GiphySelect onSelect={this.handleGifSelect} position="bottom" />
              </div>
            </div>
            {
              isEditing && (
                <button
                  className="btn save-as-draft-btn mr-2"
                  onClick={this.handleCancelEditingMode}
                >
                  Cancel
                </button>
              )
            }
            <button
              type="submit"
              className="btn btn-sm btn-primary"
              onClick={this.handleSubmit}
              disabled={buttonDisabled || isUploading || (this.isEditing() && !this.didPostChange())}
            >
              { isEditing ? 'Save' : 'SEND' }
            </button>
          </div>
        </form>
        <RoutePreventLeaving
          navigate={(path) => history.push(path)}
          when={this.didPostChange()}
          shouldBlockNavigation={(location) => location.pathname !== '/feed'}
        />
        {
          shouldShowDiscardPopup
          && (
          <Discard
            close={this.hideDiscardPopup}
            confirm={this.handleConfirmDiscard}
          />
          )
        }
      </div>
    );
  }
}


CommentForm.propTypes = {
  postId: PropTypes.number,
  action: PropTypes.string,
  commentId: PropTypes.number,
  triggerShowCommentList: PropTypes.func,
  appLabel: PropTypes.string,
  modelType: PropTypes.string,
  comment: PropTypes.shape({}),
  onCancel: PropTypes.func,
  history: PropTypes.shape({}).isRequired,
};

CommentForm.defaultProps = {
  comment: null,
  onCancel: () => {},
};

export default withRouter(CommentForm);
