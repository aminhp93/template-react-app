import * as Sentry from '@sentry/react';
import * as React from 'react';
import clsx from 'clsx';
import { GalleryItemType, FileIconClassNames } from 'constants/common';
import { makeFileName } from 'utils/media';
import FileProgressBar from './FileProgressBar';

interface IProps {
  loaded?: number;
  type?: any,
  src?: string,
  remove?: any,
  errorType?: any,
  fileKey?: any,
  fileName?: any,
  style?: any;
}

class GalleryItem extends React.PureComponent<IProps> {

  render() {
    const { type, src, loaded, remove, errorType, fileKey, fileName, style } = this.props;
    return (
      <div className={`gallery__image loading-gif ${errorType ? 'error' : ''}`}>
        {type === GalleryItemType.IMAGE
        ? (
          <img
            className={clsx({ gallery__image__loading: loaded <= 100 && !fileKey })}
            src={src}
            alt="post"
            style={style}
          />
        )
        : (
          <div className="gallery-file-icon pt-3">
            <div className="text-center">
              <i className={`fa ${FileIconClassNames[type]} fa-4x mb-3`} />
            </div>
            <div className="text-center text-sm text-break">{makeFileName(fileName, 25)}</div>
          </div>
        )}
        { loaded !== null && loaded <= 100 && !fileKey && <FileProgressBar loaded={loaded} />}
        {
          remove && <i className="fa fa-times gallery__image__remove" onClick={remove} />
        }
      </div>
    )
  }
}

export default Sentry.withProfiler(GalleryItem, { name: "GalleryItem"});
