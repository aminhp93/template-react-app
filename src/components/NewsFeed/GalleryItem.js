import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { GalleryItemType, FileIconClassNames } from 'constants/common';
import { makeFileName } from 'utils/media';
import FileProgressBar from './FileProgressBar';

const GalleryItem = ({
  type, src, loaded, remove, errorType, fileKey, fileName, style,
}) => (
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
);

GalleryItem.propTypes = {
  type: PropTypes.oneOf(Object.values(GalleryItemType)),
  src: PropTypes.string,
  loaded: PropTypes.number,
  remove: PropTypes.func,
  errorType: PropTypes.string,
  fileKey: PropTypes.string,
  style: PropTypes.shape({
    width: PropTypes.string,
    height: PropTypes.string,
  }),
  fileName: PropTypes.string,
};

GalleryItem.defaultProps = {
  loaded: null,
  errorType: null,
  fileKey: null,
  style: null,
};

export default GalleryItem;
