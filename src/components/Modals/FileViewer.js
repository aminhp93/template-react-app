import React, { Component } from 'react';
import toastr from 'toastr';
import PropTypes from 'prop-types';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { getFileUrl, getMediaTypeFromMimeType, MEDIA_TYPES } from 'utils/media';
import LoadingIndicator from 'components/LoadingIndicator';


const logger = new Logger('Media');

class FileViewer extends Component {
  state = {
    fileUrl: null,
  };

  componentDidMount() {
    getFileUrl(this.props.fileKey, this.props.fileType).then((res) => {
      this.setState({ fileUrl: res.data.url });
    }).catch((e) => {
      logger.error(e);
      toastr.error('Error loading the file');
    });
  }

  close = (e) => {
    if (!this.previewRef || !this.previewRef.contains(e.target)) {
      this.props.onClose();
    }
  };

  renderPreview() {
    const { fileUrl } = this.state;
    const fileType = getMediaTypeFromMimeType(this.props.fileType);
    if (fileType === 'DOC') {
      return (
        <iframe
          ref={(ref) => this.previewRef = ref}
          src={fileUrl}
          title="Pdf preview"
          style={{ backgroundColor: this.props.fileType === MEDIA_TYPES.DOC.TEXT && 'white' }}
        />
      );
    }
    if (fileType === 'VIDEO') {
      return (
        <video ref={(ref) => this.previewRef = ref} src={fileUrl} controls>
          <track kind="captions" label="Video preview" />
        </video>
      );
    }
    if (fileType === 'AUDIO') {
      return (
        <audio ref={(ref) => this.previewRef = ref} src={fileUrl} controls>
          <track kind="captions" label="Audio preview" />
        </audio>
      );
    }
    return <h4>Preview is not supported for this file type.</h4>;
  }

  render() {
    const { fileUrl } = this.state;
    return (
      <div className="file-preview" onClick={(e) => this.close(e)}>
        {fileUrl
          ? this.renderPreview()
          : <LoadingIndicator />}
        <i id="previewCloseButton" className="fa fa-times" onClick={this.props.onClose} />
      </div>
    );
  }
}

FileViewer.propTypes = {
  fileKey: PropTypes.string.isRequired,
  fileType: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FileViewer;
