import * as Sentry from '@sentry/react';
import * as React from 'react';
import { Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { MEDIA_TYPES, IMAGE_TYPES } from 'utils/media';

interface IFileGalleryProps {
  onChange: ({ fileList }: { fileList: any }) => void;
  fileList: any;
}

export class FileGallery extends React.Component<IFileGalleryProps> {
  public render(): JSX.Element {
    const { fileList } = this.props;
    const uploadButton = (
      <div>
        <PlusOutlined />
      </div>
    );
    const accept = IMAGE_TYPES.join(',');

    return (
      <Upload
        multiple
        accept={accept}
        listType="picture-card"
        fileList={fileList}
        onChange={this.props.onChange}
      >
        {fileList.length > 5 ? null : uploadButton}
      </Upload>
    );
  }
}
export default Sentry.withProfiler(FileGallery, { name: "FileGallery"});
