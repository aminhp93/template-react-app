import * as Sentry from '@sentry/react';
import * as React from 'react';
import { Upload } from 'antd';
import { IMAGE_TYPES } from 'utils/media';

interface IProps {
  onChange: ({ fileList }: { fileList: any }) => void;
  uploadType: 'images' | 'files';
}

export function FileSelectButton(props) {
  const uploadButton = (
    <label className="mb-0" htmlFor={this.key}>
      <div className="image-select d-flex justify-content-center align-items-center">
        <i className="fa fa-image" />
      </div>
    </label>
  );

  const { uploadType } = props;
  const accept = uploadType === 'images' ? IMAGE_TYPES.join(',') : undefined;

  return (
    <Upload
      multiple
      accept={accept}
      onChange={props.onChange}
      showUploadList={false}
    >
      {uploadButton}
    </Upload>
  );
}
export default Sentry.withProfiler(FileSelectButton, { name: "FileSelectButton"});
