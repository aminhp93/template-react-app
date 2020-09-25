import * as Sentry from '@sentry/react';
import * as React from 'react';
import clsx from 'clsx';
import { notification } from 'antd';

import { TFile } from 'types';
import { FileIconClassNames } from 'constants/common';
import {
  PREVIEW_TYPES,
  getFileUrl,
  getMediaTypeFromMimeType,
  makeFileName,
  formatBytes
} from 'utils/media';
import { FileViewer } from './FileViewer';


export type TProps = {
  file: TFile
}

const isPreviewable = (file: TFile) => {
  return PREVIEW_TYPES.includes(file.fileType)
}

export class FileMedia extends React.PureComponent<TProps> {
  state = {
    preview: false
  };

  onPreview = () => {
    this.setState({ preview: true })
  };

  onClose = (e: React.MouseEvent) => {
    /* Normally it is not necessary to explicitly call `stopPropagation`,
       however, in our specific case, the component tree is like this:

       UserMessage
       - FileMedia
         - FileViewer

       The `onClick` handler which turn on the preview, if we don't stop
       propagation here, the click will propagate to that and case `onClose` not
       working. click -> onClose -> bubble -> onPreview.

       The proper fix for this is to use something like `Portal` in
       `FileViewer`, to properly display the preview modal. */
    e.stopPropagation();

    this.setState({ preview: false })
  };

  onDownload = (e: React.MouseEvent) => {
    e.stopPropagation();

    const { fileKey, fileType } = this.props.file;

    /* `window.open(url)` alone would have worked, except that for Safari, it
       only work for user-initiated actions (.i.e: link click), not async
       functions.

       Ref:
       https://stackoverflow.com/questions/20696041/window-openurl-blank-not-working-on-imac-safari
     */
    const ref = window.open();

    getFileUrl(fileKey, fileType, true)
      .then((res) => {
        ref.location = res.data.url;
        setTimeout(() => ref.close(), 4000);
      })
      .catch((e) => {
        notification.error({
          message: 'Error while downloading the file',
          description: e.message
        });
      });
  };

  render() {
    const { file } = this.props;
    const { preview } = this.state;
    const previewable = isPreviewable(file);
    const icon = FileIconClassNames[getMediaTypeFromMimeType(file.fileType)];

    return (
      <div
        className={clsx('chat-message-file', { previewable })}
        onClick={this.onPreview}
      >
        <i className={clsx('fa fa-3x mr-2', icon)} />
        <div className="chat-message-file--info">
          <b>{file.name && makeFileName(file.name, 15)}</b> <br />
          {formatBytes(file.size)}
        </div>
        <div className="chat-message-file--action">
          <i
            className="fa fa-cloud-download fa-lg"
            onClick={this.onDownload}
          />
        </div>

        {previewable && preview && (
          <FileViewer
            fileKey={file.fileKey}
            fileType={file.fileType}
            onClose={this.onClose}
          />
        )}
      </div>
    )
  }
}
export default Sentry.withProfiler(FileMedia, { name: "FileMedia"});
