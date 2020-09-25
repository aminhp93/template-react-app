import * as Sentry from '@sentry/react';
import React from 'react';
import { notification } from 'antd';
import { getFileUrl, getMediaTypeFromMimeType, MEDIA_TYPES } from 'utils/media';
import LoadingIndicator from './LoadingIndicator';

interface IProps {
  fileKey: any;
  fileType: any;
  onClose: (e: React.MouseEvent) => void;
}


export class FileViewer extends React.PureComponent<IProps> {
  state = {
    fileUrl: null,
  };

  componentDidMount() {
    getFileUrl(this.props.fileKey, this.props.fileType)
      .then((res) => {
        this.setState({ fileUrl: res.data.url });
      })
      .catch((e) => {
        notification.error({
          message: 'Error loading the file',
          description: e.message
        });
      });
  }

  renderPreview() {
    const { fileUrl } = this.state;
    const fileType = getMediaTypeFromMimeType(this.props.fileType);
    if (fileType === 'DOC') {
      return (
        <iframe
          src={fileUrl}
          title="Pdf preview"
          style={{
            backgroundColor:
              this.props.fileType === MEDIA_TYPES.DOC.TEXT && 'white',
          }}
        />
      );
    }
    if (fileType === 'VIDEO') {
      return (
        <video src={fileUrl} controls>
          <track kind="captions" label="Video preview" />
        </video>
      );
    }
    if (fileType === 'AUDIO') {
      return (
        <audio src={fileUrl} controls>
          <track kind="captions" label="Audio preview" />
        </audio>
      );
    }
    return <h4>Preview is not supported for this file type.</h4>;
  }

  render() {
    const { fileUrl } = this.state;
    return (
      <div className="file-preview" onClick={this.props.onClose}>
        {fileUrl ? this.renderPreview() : <LoadingIndicator />}
        <i
          id="previewCloseButton"
          className="fa fa-times"
          onClick={this.props.onClose}
        />
      </div>
    );
  }
}

export default Sentry.withProfiler(FileViewer, { name: "FileViewer"});
