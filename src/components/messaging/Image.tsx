import * as Sentry from '@sentry/react';
import * as React from 'react';

import config from 'config';
import { DEFAULT_IMAGE } from 'utils/media';

interface IProps {
  file: any;
  className: string;
  onClick: any;
}

class Image extends React.PureComponent<IProps> {
  render() {
    const { file, className, onClick } = this.props;

    let src = DEFAULT_IMAGE;

    if (
      file.filePreview &&
      file.filePreview.includes(config.cloudFrontEndpoint.url)
    ) {
      src = file.filePreview;
    }

    return (
      <div className="image-layout--image">
        <img
          src={src}
          alt={file.fileKey}
          className={className}
          onClick={onClick}
        />
      </div>
    );
  }
}

export default Sentry.withProfiler(Image, { name: "Image"});
