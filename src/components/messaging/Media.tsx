import * as Sentry from '@sentry/react';
import React from 'react';
import { map, filter, isArray, get } from 'lodash';
import { connect } from 'react-redux';
import { notification } from 'antd';

import {
  MEDIA_TYPES,
  getImageURL,
  getMediaTypeFromMimeType,
  UPLOAD_TYPES,
  formatBytes,
  makeFileName,
  getFileUrl,
  PREVIEW_TYPES,
} from 'utils/media';
import GifPlayer from 'react-gif-player';
import { IMAGE_SIZES, FileIconClassNames } from 'constants/common';
import Image from './Image';
import PostGifPlayer from './PostGifPlayer';
import FileViewer from './FileViewer';
import { ImageSize } from 'types';

import POWERED_BY_GIPHY_URL from '@img/PoweredBy_200px-White_HorizText.png';


const THRESHOLD_THUMBNAIL = 5;

interface IProps {
  files: any;
  messageId: number;
  fromChatMessage?: boolean;
  fromComment?: boolean;
  selectedConversationId: number;
}

class Media extends React.PureComponent<IProps> {
  constructor(props) {
    super(props);
    const { files } = props;
    const pureSources = filter(files, (item) => item.fileKey);
    let thumbnail = null;

    if (
      isArray(pureSources) &&
      pureSources.length > 0 &&
      pureSources.length >= THRESHOLD_THUMBNAIL
    ) {
      const edits = {
        resize: {
          width: IMAGE_SIZES.normal.width,
          height: IMAGE_SIZES.normal.height,
          fit: 'inside',
        },
        rotate: null
      };
      thumbnail =
        files.length === 0
          ? getImageURL(pureSources[THRESHOLD_THUMBNAIL - 2].fileKey, edits)
          : files[THRESHOLD_THUMBNAIL - 2].fileKey;
    }
    this.state = {
      thumbnail,
      loadedImagesCount: 0,
    };
  }

  viewImage = (index) => {
    //
  };

  viewMore = () => {
    //
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

    getFileUrl(fileKey, fileType, true)
      .then((res) => {
        ref.location = res.data.url;
        setTimeout(() => ref.close(), 4000);
      })
      .catch((e) => {
        notification.error({
          message: 'Error',
          description: 'Error while downloading the file',
          placement: 'bottomLeft',
          duration: 5,
        });
      });
  };

  renderImage = (file, index) => {
    const { fromChatMessage, fromComment } = this.props;

    return (
      <Image
        file={file}
        key={index}
        onClick={() => this.viewImage(index)}
        className={
          fromComment || fromChatMessage
            ? ImageSize.Thumbnail
            : ImageSize.Normal
        }
      />
    );
  };

  renderGif = (file) => {
    const { fromChatMessage } = this.props;
    if (fromChatMessage) {
      return (
        <div className="mb-0 text-prewrap text-break gif-message">
          <span
            className="mt-2"
            style={{ display: 'inline-grid' }}
            ref={(ref) =>
              ref &&
              ref.querySelector('.gif_player') &&
              ref.querySelector('.gif_player').click()
            }
          >
            <div>
              <GifPlayer gif={file.fileKey} still={file.filePreview} />
            </div>
            <div className="mt-1">
              <img
                className="pull-right"
                src={POWERED_BY_GIPHY_URL}
                alt="giphy logo"
                height={12}
              />
            </div>
          </span>
        </div>
      );
    }
    return (
      <div
        className="image-layout--image image-layout--image--gif"
        key={file.fileKey}
      >
        <PostGifPlayer
          gif={file.fileKey}
          still={file.filePreview}
          autoPlay={true}
        />
        <img
          src={POWERED_BY_GIPHY_URL}
          alt="giphy logo"
          height={12}
        />
      </div>
    );
  };

  renderFile = (file, index) => {
    const name = file.name && makeFileName(file.name, 15);
    const formattedSize = file.size ? formatBytes(file.size) : 'N/A';
    const previewable = PREVIEW_TYPES.includes(file.fileType);
    return (
      <div
        className={`chat-message-file ${previewable ? previewable : ''}`}
        key={index}
        onClick={(e) => (previewable ? this.previewFile(e, file) : {})}
      >
        <i
          className={`fa ${
            FileIconClassNames[getMediaTypeFromMimeType(file.fileType)]
          } fa-3x mr-2`}
        />
        <div className="chat-message-file--info">
          <b>{name}</b> <br />
          {formattedSize}
        </div>
        <div className="chat-message-file--action">
          <i
            ref={(ref) => (this.downloadButtonRef = ref)}
            className="fa fa-cloud-download fa-lg"
            onClick={() => this.downloadFile(file.fileKey, file.fileType)}
          />
        </div>
      </div>
    );
  };

  renderPreviewItem = (file, index) => {
    const itemType = file.fileType;
    if (Object.values(MEDIA_TYPES.IMAGE).includes(itemType)) {
      return this.renderImage(file, index);
    }
    if (itemType === MEDIA_TYPES.GIF) {
      return this.renderGif(file);
    }
    return null;
  };

  renderNoPreviewItem = (file, index) => {
    const itemType = file.fileType;
    if (Object.values(MEDIA_TYPES.IMAGE).includes(itemType)) {
      return null;
    }
    if (itemType === MEDIA_TYPES.GIF) {
      return null;
    }
    if (UPLOAD_TYPES.includes(itemType)) {
      return this.renderFile(file, index);
    }
    return this.renderFile(file, index);
  };

  render() {
    const { files, fromChatMessage } = this.props;
    const { thumbnail, showingFile } = this.state;
    const pureSources = filter(files, (item) => item.fileKey);
    if (fromChatMessage) {
      return (
        <div className="image-layout">
          {map(files, this.renderPreviewItem)}
          {pureSources.length > 0 && (
            <div className="my-2">
              {map(pureSources, this.renderNoPreviewItem)}
            </div>
          )}
          {showingFile && (
            <FileViewer
              fileKey={showingFile.fileKey}
              fileType={showingFile.fileType}
              onClose={() => this.setState({ showingFile: null })}
            />
          )}
        </div>
      );
    }
    if (isArray(pureSources) && pureSources.length > 0) {
      if (pureSources.length < THRESHOLD_THUMBNAIL) {
        return (
          <div className={`image-layout image-layout--${pureSources.length}`}>
            {map(pureSources, this.renderPreviewItem)}
          </div>
        );
      }

      return (
        <div className="image-layout image-layout--multi">
          {map(
            pureSources.slice(0, THRESHOLD_THUMBNAIL - 2),
            this.renderPreviewItem
          )}
          <div
            className="image-layout--image image-layout--image__placeholder"
            onClick={this.viewMore}
          >
            <img src={thumbnail} alt="placeholder" />
            <span className="plus">
              + {pureSources.length - (THRESHOLD_THUMBNAIL - 1)}
            </span>
          </div>
        </div>
      );
    }

    return null;
  }
}

const mapStateToProps = (state) => {
  const conversations = get(state, 'conversations') || {};
  const selectedConversationId = get(state, 'selectedConversationId');
  return {
    selectedConversationId,
    selectedConversation: conversations[selectedConversationId] || {},
    authUser: get(state, 'authUser') || {},
    messages: get(state, 'messages') || {},
    users: get(state, 'users') || {},
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(Media, { name: "Media"}));
