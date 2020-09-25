import * as Sentry from '@sentry/react';
import * as React from 'react';
import { notification } from 'antd';
import Lightbox from 'react-image-lightbox';
import clsx from 'clsx';

import { TFile } from 'types';
import { IMAGE_SIZES } from 'constants/common';
import { getImageURL, getFileUrl } from 'utils/media';


export type TProps = {
  images: TFile[]
};

/**
 * This is a version of {@link ImageViewer}, with the
 * following distinction: its full-size images are not the original file.
 * Original photos taken by smartphones can be massive and would cause
 * very slow load. Moreover, they requires calling to AWS API to
 * generate the URL, which is another point of slowing down. Instead
 * this component uses Cloudfront, which URLs can be pre-generated
 * and with image of the size {@link IMAGE_SIZES#full}.
 *
 * In ideal scenario, this will be handled on server and the client
 * doesn't have to know anything about all this.
 *
 * @note: should also use this in {@link MessageItem2}.
 */
export class Gallery extends React.PureComponent<TProps> {
  state = {
    selected: null
  }

  onSelect = (index: number) => {
    this.setState({ selected: index });
  }

  onClose = () => {
    this.setState({ selected: null });
  }

  onDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const image = this.props?.images[this.state.selected];
    if (!image) return;

    const ref = window.open();

    try {
      const response = await getFileUrl(image.fileKey, image.fileType, true);
      ref.location = response.data.url;
    } catch (e) {
      notification.error({
        message: 'Error while downloading the file',
        description: e.message
      });
    } finally {
      setTimeout(() => ref.close(), 3000);
    }
  }

  render() {
    const { images } = this.props;
    const { selected } = this.state;

    const params = {
      resize: { ...IMAGE_SIZES.full, fit: 'inside' },
      rotate: null
    };

    const next = (selected != null) && (selected + 1) % images.length;
    const prev = (selected != null) && (selected + images.length - 1) % images.length;


    return (
      <div className={clsx('image-layout', `image-layout--${images.length}`)}>
        {images.map(({ name, fileKey, filePreview }, index) => (
          <div key={fileKey} className="image-layout--image" onClick={() => this.onSelect(index)}>
            <img alt={name} src={filePreview} className="image-thumbnail" />
          </div>
        ))}

        {selected !== null && (
          <Lightbox
            mainSrc={getImageURL(images[selected].fileKey, params)}

            nextSrc={getImageURL(images[next].fileKey, params)}
            onMoveNextRequest={() => this.onSelect(next)}

            prevSrc={getImageURL(images[prev].fileKey, params)}
            onMovePrevRequest={() => this.onSelect(prev)}

            onCloseRequest={this.onClose}
            clickOutsideToClose

            toolbarButtons={[(
              <button
                key="download"
                className="ril__builtinButton ril__toolbarItemChild m-btn-download"
                onClick={this.onDownload}>
                Download
              </button>
            )]}

            wrapperClassName="image-viewer"
            reactModalStyle={{ overlay: { zIndex: 9999 } }}
          />
        )}
      </div>
    );
  }
}
export default Sentry.withProfiler(Gallery, { name: "Gallery"});
