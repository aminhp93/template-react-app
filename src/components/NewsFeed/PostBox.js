import React, { Fragment } from 'react';
import * as PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import differenceBy from 'lodash/differenceBy';
import Dropzone from 'react-dropzone';
import clsx from 'clsx';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { withRouter } from 'react-router-dom';
import deepEqual from 'deep-equal';
import { EditorState, convertToRaw } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import createEmojiPlugin from 'draft-js-emoji-plugin';
import createMentionPlugin from 'draft-js-mention-plugin';

import FeedService from 'services/Feed';
import MentioningUserService from 'services/MentioningUser';
import { removeFileFromS3AndStorage } from 'services/S3';
import { URL_REGEX, EMAIL_REGEX } from 'constants/regex';
import { AttachmentTypes, S3_BUCKET_PREFIX } from 'constants/common';
import emitter, { EVENT_KEYS } from 'utils/event';
import userInfo from 'utils/userInfo';
import Discard from 'components/Modals/Discard';
import ImageSelect from 'components/NewsFeed/ImageSelect';
import Gallery from 'components/NewsFeed/Gallery';
import { GiphySelect } from 'components/Giphy';
import {
  getUploadedImages,
  IMAGE_TYPES,
  MEDIA_TYPES,
  removeImage,
  selectGif,
  uploadImages,
} from 'utils/media';
import { formatMentionedUser, getEntities } from 'utils/contentEnhancer';
import { SetS3Config } from 'config/s3';
import GifInEditor from 'components/NewsFeed/Media/GifInEditor';
import { getInitialState } from 'utils/content';
import ChannelMentionEntry from 'components/messaging/ChannelMentionEntry';
import RoutePreventLeaving from '../RoutePreventLeaving';

const logger = new Logger('pages/newsfeed');

const contentOriginal = EditorState.createEmpty();

const emptyArray = [];

const defaultState = {
  contentOriginal,
  content: contentOriginal,
  contentContainsLink: false, // used for tracking
  buttonDisabled: true,
  suggestions: [],
  mentionedUsers: [],
  uploadedImagesOriginal: emptyArray,
  uploadedImages: emptyArray,
  selectedGifOriginal: null,
  selectedGif: null,
  shouldShowDiscardPopup: false,
  loadingGif: false,
  gifURL: null,
};

class PostBox extends React.Component {
  static propTypes = {
    onCreatePostSuccess: PropTypes.func.isRequired,
    history: PropTypes.shape({}).isRequired,
    post: PropTypes.shape({}),
    onCancel: PropTypes.func,
  };

  static defaultProps = {
    post: {},
    onCancel: () => {},
  };

  constructor(props) {
    super(props);

    this.state = this.isEditing() ? this.initState() : defaultState;
    const customPrefix = {
      public: S3_BUCKET_PREFIX.POST,
    };
    SetS3Config('public', customPrefix);

    this.initPlugins();
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.handleLeavePage);
  }

  componentWillUnmount() {
    const { uploadedImages } = this.state;

    if (!this.isEditing()) {
      uploadedImages.map((file) => removeFileFromS3AndStorage({ ...file, file_prefix: S3_BUCKET_PREFIX.POST }));
    }
    window.removeEventListener('beforeunload', this.handleLeavePage);
  }

  onChange = (editorState) => {
    const { uploadedImages, selectedGif } = this.state;
    const errorImage = uploadedImages.find((image) => image.errorType);
    const buttonDisabled = (!(editorState.getCurrentContent().getPlainText().length) && uploadedImages.length === 0 && !selectedGif) || !!errorImage;

    this.setState({
      content: editorState,
      buttonDisabled,
    });
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

  handleLeavePage = (e) => {
    const { uploadedImages, content } = this.state;

    if (content.getCurrentContent().getPlainText().length > 0 || uploadedImages.length > 0) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  handleChange = (e) => {
    e.preventDefault();
    const content = e.target.value;
    this.setState({ content });
  };

  isInvalidPost = () => {
    const { buttonDisabled, uploadedImages } = this.state;

    return buttonDisabled || !uploadedImages.every((image) => image.loaded === 100);
  };

  handleSubmit = () => {
    // Disabled button click
    this.setState({
      buttonDisabled: true,
    });
    const { post } = this.props;
    let { content } = this.state;
    const { uploadedImages, selectedGif } = this.state;
    const entities = getEntities(content);
    const { blocks, entityMap } = convertToRaw(content.getCurrentContent());

    content = content.getCurrentContent().getPlainText();
    content = formatMentionedUser(content, blocks, entityMap, entities);
    content = this.formatContent(content);
    let files = uploadedImages.map((image) => ({
      file_key: image.file_key,
      file_type: image.type,
      file_prefix: S3_BUCKET_PREFIX.POST,
    }));
    if (!isEmpty(selectedGif)) {
      files = [{
        file_key: get(selectedGif, 'images.original.url'),
        file_sub_key: get(selectedGif, 'images.original_still.url'),
        file_type: MEDIA_TYPES.GIF,
      }];
    }

    const submit = this.isEditing()
      ? FeedService.updatePost({ content, files }, post.eid)
      : FeedService.createPost({ content, files });

    submit.then((res) => {
      if (res && res.data) {
        uploadedImages.map((file) => URL.revokeObjectURL(file.src));
        this.removeFileFromS3AndStorageOnSubmit();
        this.setState({
          content: EditorState.createEmpty(),
          contentContainsLink: this.isContentContainLink(content),
          uploadedImages: [],
          selectedGif: null,
        }, () => {
          if (!this.isEditing()) {
            emitter.emit(EVENT_KEYS.CREATE_NEWS_FEED_POST, {
              userId: userInfo.getUserInfo().id,
              contentContainsLink: this.state.contentContainsLink,
            });
          }
          if (uploadedImages.length > 0) {
            emitter.emit(EVENT_KEYS.POST_UPLOAD_IMAGES, {
              userId: userInfo.getUserId(),
              contentContainsLink: this.state.contentContainsLink,
            });
          }
          // Enabled button click
          this.setState({
            buttonDisabled: false,
          });
        });
        this.props.onCreatePostSuccess(res.data);
      }
    }).catch((error) => {
      logger.error(error);
    });
  };

  isEditing = () => !isEmpty(this.props.post);

  initState = () => {
    const { post } = this.props;
    const initialState = getInitialState(post);
    const state = {
      ...defaultState,
      ...initialState,
    };
    let uploadedImages = [];

    if (!initialState.hasGifAttachment) {
      uploadedImages = getUploadedImages(post.files);
    }

    return {
      ...state,
      uploadedImages,
    };
  };

  initPlugins = () => {
    const emojiPlugin = createEmojiPlugin();
    const mentionPlugin = createMentionPlugin({
      mentionPrefix: '@',
      entityMutability: 'IMMUTABLE',
      supportWhitespace: true,
    });

    this.emojiPlugin = emojiPlugin;
    this.mentionPlugin = mentionPlugin;
  };

  formatContent = (text) => {
    let content = text;

    content = this.formatElementByRegex(content, URL_REGEX);
    content = this.formatElementByRegex(content, EMAIL_REGEX);

    return content;
  };

  formatElementByRegex = (text, regex) => {
    let content = text;
    const matches = text.match(regex);
    if (!(matches && matches.length)) return content;
    matches.forEach((match) => {
      content = content.replace(match, `<${match}>`);
    });
    return content;
  };

  isContentContainLink = (content) => {
    const matches = content.match(URL_REGEX);
    return matches !== null;
  };

  handleProgressCallback = (progress, key) => {
    this.setState(({ uploadedImages }) => {
      const nextUploadedImages = uploadedImages.map((image) => {
        if (image.key === key) {
          return {
            ...image,
            loaded: Math.ceil((progress.loaded * 100) / progress.total),
          };
        }

        return image;
      });

      return {
        uploadedImages: nextUploadedImages,
      };
    });
  };

  handleGetResult = (result, key) => {
    this.setState(({ uploadedImages }) => {
      const nextUploadedImages = uploadedImages.map((image) => {
        if (image.key === key) {
          return {
            ...image,
            file_key: result.key,
          };
        }

        return image;
      });

      return {
        uploadedImages: nextUploadedImages,
      };
    });
  };

  storeUploadedImagesToState = (uploadedImage) => {
    this.setState(({ uploadedImages }) => ({
      uploadedImages: [
        ...uploadedImages,
        uploadedImage,
      ],
    }));
    if (uploadedImage.errorType) {
      this.setState({
        buttonDisabled: true,
      });
    }
  };

  uploadImages = (files) => {
    this.setState({ buttonDisabled: false });
    uploadImages(
      files,
      this.storeUploadedImagesToState,
      this.handleProgressCallback,
      this.handleGetResult,
    );
  };

  handleDrop = (files) => {
    this.uploadImages(files);
  };

  handleOnOrdered = (orderedImages) => {
    this.setState({ uploadedImages: orderedImages });
  };

  handleDownloadingFinish = (url) => {
    this.setState({ loadingGif: false, gifURL: url, buttonDisabled: false });
  };

  handleGifSelect = (selectedGif) => {
    this.setState({ selectedGif, loadingGif: true });
    selectGif(selectedGif, this.handleDownloadingFinish);
  };

  handleCancel = () => {
    this.props.onCancel();
  };

  handleCancelEditingMode = () => {
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

  shouldDisableButton = (attachmentType) => {
    const { uploadedImages, selectedGif } = this.state;

    if (isEmpty(uploadedImages) && attachmentType === AttachmentTypes.GIF) return false;
    if (isEmpty(selectedGif) && attachmentType === AttachmentTypes.FILE) return false;

    return true;
  };

  isEmptyContent = () => {
    const { content, uploadedImages, selectedGif } = this.state;
    return isEmpty(content.getCurrentContent().getPlainText()) && uploadedImages.length === 0 && !selectedGif;
  };

  didContentChange = () => {
    const { contentOriginal: original, content } = this.state;
    return original.getCurrentContent().getPlainText() !== content.getCurrentContent().getPlainText();
  };

  didUploadedImagesChange = () => {
    const { uploadedImagesOriginal, uploadedImages } = this.state;
    return !deepEqual(uploadedImagesOriginal, uploadedImages);
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

  removeFileFromS3AndStorageOnSubmit = () => {
    const { uploadedImagesOriginal, uploadedImages } = this.state;
    const imagesToRemove = differenceBy(uploadedImagesOriginal, uploadedImages, 'file_key');

    imagesToRemove.forEach((file) => removeFileFromS3AndStorage({ ...file, file_prefix: S3_BUCKET_PREFIX.POST }));
  };

  removeImage = (key) => {
    const { uploadedImages, content } = this.state;
    const isEditing = this.isEditing();

    this.setState({ ...removeImage(uploadedImages, content, key, isEditing) });
  };

  removeGif = () => {
    const { uploadedImages, content } = this.state;

    this.setState({ selectedGif: null });
    if (content.getCurrentContent().getPlainText().length === 0 && uploadedImages.length === 0) {
      this.setState({ buttonDisabled: true });
    }
  };

  render() {
    const {
      content, suggestions, uploadedImages, shouldShowDiscardPopup,
      selectedGif, loadingGif, gifURL, buttonDisabled,
    } = this.state;
    const { history } = this.props;
    const isUploading = uploadedImages.find((file) => !file.file_key);
    const { EmojiSuggestions, EmojiSelect } = this.emojiPlugin;
    const { MentionSuggestions } = this.mentionPlugin;
    const plugins = [this.emojiPlugin, this.mentionPlugin];

    return (
      <>
        <div className="post-box">
          <Dropzone
            onDrop={this.handleDrop}
            accept={IMAGE_TYPES}
          >
            {({ getRootProps, isDragActive }) => (
              <div {...getRootProps()} className={clsx({ 'post-box__dropzone--isActive': isDragActive })}>
                <div className="post-input__text-editor-container border-bottom">
                  <Editor
                    editorState={content}
                    plugins={plugins}
                    onChange={this.onChange}
                    ref={(element) => { this.editor = element; }}
                    placeholder="What do you want to talk about?"
                  />
                  <EmojiSuggestions />
                  <MentionSuggestions
                    onSearchChange={this.onSearchChange}
                    suggestions={suggestions}
                    entryComponent={ChannelMentionEntry}
                  />
                </div>
                { uploadedImages.length > 0
                && (
                <Gallery
                  files={uploadedImages}
                  onAddMore={this.uploadImages}
                  remove={this.removeImage}
                  onOrdered={this.handleOnOrdered}
                  imageOnly
                />
                )}
                {isDragActive && <p className="post-box__dropzone__drop_images"><span>Drop images here...</span></p>}
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
          <div className="post-box__footer">
            <div className="left-side action-group">
              <EmojiSelect />
              <div className={clsx({ 'action-group__item--disable': this.shouldDisableButton(AttachmentTypes.FILE) })}>
                <ImageSelect onSelect={this.uploadImages} />
              </div>
              <div className={clsx({ 'action-group__item--disable': this.shouldDisableButton(AttachmentTypes.GIF) })}>
                <GiphySelect onSelect={this.handleGifSelect} position="bottom" />
              </div>
            </div>
            <div>
              {
                this.isEditing() && (
                  <button
                    className="btn save-as-draft-btn mr-2"
                    onClick={this.handleCancelEditingMode}
                  >
                    Cancel
                  </button>
                )
              }
              <button
                className="btn btn-primary"
                disabled={buttonDisabled || isUploading || (this.isEditing() ? !this.didPostChange() : this.isEmptyContent())}
                onClick={this.handleSubmit}
              >
                { this.isEditing() ? 'Save' : 'Post' }
              </button>
            </div>
          </div>
        </div>
        <RoutePreventLeaving
          navigate={(path) => history.push(path)}
          when={this.didPostChange()}
          shouldBlockNavigation={(location) => location.pathname !== '/feed'}
        />
        {
          shouldShowDiscardPopup
            && (
            <Discard
              target="post"
              close={this.hideDiscardPopup}
              confirm={this.handleConfirmDiscard}
            />
            )
        }
      </>
    );
  }
}

export default withRouter(PostBox);
