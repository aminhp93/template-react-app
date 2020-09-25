import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { map, filter, isArray } from 'lodash';
import { connect } from 'react-redux';
import toastr from 'toastr';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { showModal } from 'actions/modal';
// import { markAsImagesLoaded } from 'actions/chat';
import {
  MEDIA_TYPES, getImageURL, getMediaTypeFromMimeType, UPLOAD_TYPES,
  formatBytes, makeFileName, getFileUrl, PREVIEW_TYPES,
} from 'utils/media';
import FileViewer from 'components/Modals/FileViewer';
import GifPlayer from 'react-gif-player';
import { IMAGE_SIZES, ModalKey, FileIconClassNames } from 'constants/common';
import Image from './Image';
import PostGifPlayer from './PostGifPlayer';

import POWERED_BY_GIPHY_URL from '@img/PoweredBy_200px-White_HorizText.png';


const THRESHOLD_THUMBNAIL = 5;

const logger = new Logger(__filename);

class Media extends PureComponent {
  constructor(props) {
    super(props);
    const { sources, filesJSON } = props;
    const pureSources = filter(sources, (source) => source.file_key);
    let thumbnail = null;

    if (isArray(pureSources) && pureSources.length > 0 && pureSources.length >= THRESHOLD_THUMBNAIL) {
      const edits = {
        resize: {
          width: IMAGE_SIZES.normal.width,
          height: IMAGE_SIZES.normal.height,
          fit: 'inside',
        },
        rotate: null
      };
      thumbnail = filesJSON.length === 0
        ? getImageURL(pureSources[THRESHOLD_THUMBNAIL - 2].file_key, edits)
        : filesJSON[THRESHOLD_THUMBNAIL - 2].file_key;
    }
    this.state = {
      thumbnail,
      loadedImagesCounter: 0,
    };
  }

  // increaseLoadedImagesCount = () => {
  //   const {
  //     sources, markAsImagesLoaded: markAsImagesLoadedAction, fromChatMessage, conversationId, messageId,
  //   } = this.props;
  //   this.setState(({ loadedImagesCount }) => {
  //     if (loadedImagesCount + 1 === sources.length && fromChatMessage) {
  //       markAsImagesLoadedAction(conversationId, messageId);
  //     }
  //     return { loadedImagesCount: loadedImagesCount + 1 };
  //   });
  // };

  viewImage = (index) => {
    this.props.showModal(ModalKey.IMAGE_VIEWER, { modalData: { sources: this.props.sources, currentIndex: index } });
  };

  viewMore = () => {
    this.props.showModal(ModalKey.IMAGE_VIEWER, { modalData: { sources: this.props.sources, currentIndex: THRESHOLD_THUMBNAIL - 2 } });
  };

  previewFile = (e, source) => {
    if (!this.downloadButtonRef || !this.downloadButtonRef.contains(e.target)) {
      this.setState({ showingFile: source });
    }
  };

  downloadFile = (fileKey, fileType) => {
    // window.open(url) would have worked, except that for Safari, it only work for
    // user-initiated actions (.i.e: link click), not async functions. However, window.open() could work.
    // Ref: https://stackoverflow.com/questions/20696041/window-openurl-blank-not-working-on-imac-safari
    const ref = window.open();

    getFileUrl(fileKey, fileType, true).then((res) => {
      ref.location = res.data.url;
      setTimeout(() => ref.close(), 4000);
    }).catch((e) => {
      logger.error(e);
      toastr.error('Error downloading the file');
    });
  };

  renderImage = (source, index) => {
    const {
      fromChatMessage, fullPage, fromComment,
    } = this.props;
    let size = IMAGE_SIZES.normal;

    if (fromComment) {
      size = IMAGE_SIZES.thumbnail;
    }
    if (fromChatMessage) {
      size = IMAGE_SIZES.small;

      if (fullPage) {
        size = IMAGE_SIZES.thumbnail;
      }
    }
    return (
      <Image
        source={source}
        key={index}
        onClick={() => this.viewImage(index)}
        size={size}
        fullPage={fullPage}
        // increaseLoadedImagesCount={this.increaseLoadedImagesCount}
      />
    );
  };

  renderGif = (source) => {
    const { fromChatMessage } = this.props;
    if (fromChatMessage) {
      return (
        <div className="mb-0 text-prewrap text-break gif-message">
          <span className="mt-2" style={{ display: 'inline-grid' }} ref={(ref) => this.node = ref}>
            <div>
              <GifPlayer
                gif={source.file_key}
                still={source.file_sub_key}
              />
            </div>
            <div className="mt-1">
              <img className="pull-right" src={POWERED_BY_GIPHY_URL} alt="giphy logo" height={12} />
            </div>
          </span>
        </div>
      );
    }
    return (
      <div className="image-layout--image image-layout--image--gif" key={source.file_key}>
        <PostGifPlayer
          gif={source.file_key}
          still={source.file_sub_key}
        />
        <img src={POWERED_BY_GIPHY_URL} alt="giphy logo" height={12} />
      </div>
    );
  };

  renderFile = (source, index) => {
    const name = source.name && makeFileName(source.name, 15);
    const formattedSize = source.size ? formatBytes(source.size) : 'N/A';
    const previewable = PREVIEW_TYPES.includes(source.file_type);

    if (source.file_key.startsWith('http')) {
      source = this.props.sources.find(s => s.name === source.name)
    }

    return (
      <div
        className={clsx('chat-message-file', { previewable })}
        key={index}
        onClick={(e) => (previewable ? this.previewFile(e, source) : {})}
      >
        <i className={`fa ${FileIconClassNames[getMediaTypeFromMimeType(source.file_type)]} fa-3x mr-2`} />
        <div className="chat-message-file--info">
          <b>{name}</b>
          {' '}
          <br />
          {formattedSize}
        </div>
        <div className="chat-message-file--action">
          <i
            ref={(ref) => this.downloadButtonRef = ref}
            className="fa fa-cloud-download fa-lg"
            onClick={() => this.downloadFile(source.file_key, source.file_type)}
          />
        </div>
      </div>
    );
  };

  renderPreviewItem = (source, index) => {
    const itemType = source.file_type;
    if (Object.values(MEDIA_TYPES.IMAGE).includes(itemType)) return this.renderImage(source, index);
    if (itemType === MEDIA_TYPES.GIF) return this.renderGif(source);
    return null;
  };

  renderNoPreviewItem = (source, index) => {
    const itemType = source.file_type;
    if (Object.values(MEDIA_TYPES.IMAGE).includes(itemType)) return null;
    if (itemType === MEDIA_TYPES.GIF) return null;
    if (UPLOAD_TYPES.includes(itemType)) return this.renderFile(source, index);
    return this.renderFile({ ...source, file_type: MEDIA_TYPES.DOC.TEXT }, index);
  };

  render() {
    const { sources, fromChatMessage, filesJSON } = this.props;
    const { thumbnail, showingFile } = this.state;
    const pureSources = filesJSON.length > 0
      ? filter(filesJSON, (source) => source.file_key)
      : filter(sources, (source) => source.file_key);

    if (fromChatMessage) {
      return (
        <div className="image-layout">
          {map(filesJSON.length > 0 ? filesJSON : sources, this.renderPreviewItem)}
          { pureSources.length > 0 && (
            <div className="my-2">
              {map(pureSources, this.renderNoPreviewItem)}
            </div>
          )}
          {showingFile
            && (
            <FileViewer
              fileKey={showingFile.file_key}
              fileType={showingFile.file_type}
              onClose={() => this.setState({ showingFile: null })}
            />
            )}
        </div>
      );
    }
    if (isArray(pureSources) && pureSources.length > 0) {
      if (pureSources.length < THRESHOLD_THUMBNAIL) {
        return (
          <div className={clsx('image-layout', `image-layout--${pureSources.length}`)}>
            {map(pureSources, this.renderPreviewItem)}
          </div>
        );
      }

      return (
        <div className={clsx('image-layout', 'image-layout--multi')}>
          {map(pureSources.slice(0, THRESHOLD_THUMBNAIL - 2), this.renderPreviewItem)}
          <div className="image-layout--image image-layout--image__placeholder" onClick={this.viewMore}>
            <img src={thumbnail} alt="placeholder" />
            <span className="plus">
              +
              {pureSources.length - (THRESHOLD_THUMBNAIL - 1)}
            </span>
          </div>
        </div>
      );
    }

    return null;
  }
}

Media.propTypes = {
  sources: PropTypes.arrayOf(PropTypes.shape({
    file_key: PropTypes.string.isRequired,
    file_type: PropTypes.string.isRequired,
    file_prefix: PropTypes.string,
  })).isRequired,
  showModal: PropTypes.func.isRequired,
  fromComment: PropTypes.bool,
  fromChatMessage: PropTypes.bool,
  fullPage: PropTypes.bool,
  filesJSON: PropTypes.arrayOf(PropTypes.shape({
    file_key: PropTypes.string.isRequired,
    file_type: PropTypes.string.isRequired,
  })),
  // markAsImagesLoaded: PropTypes.func.isRequired,
  messageId: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  conversationId: PropTypes.number,
};

Media.defaultProps = {
  fromComment: false,
  fromChatMessage: false,
  fullPage: false,
  filesJSON: [],
  messageId: null,
  conversationId: null,
};

const mapDispatchToProps = {
  showModal,
  // markAsImagesLoaded,
};

export default connect(null, mapDispatchToProps)(Media);
