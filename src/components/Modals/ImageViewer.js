import React, { PureComponent } from 'react';
import { map, get } from 'lodash';
import PropTypes from 'prop-types';
import Lightbox from 'react-image-lightbox';
import { fetchImageUrl } from 'utils/media';

const customStyles = {
  overlay: {
    zIndex: 9999,
  },
};

class ImageViewer extends PureComponent {
  state = {
    imageUrls: [],
    photoIndex: get(this.props.modalData, 'currentIndex', 0),
    isLoading: true,
  };

  componentDidMount() {
    this.fetchImageUrls();
  }

  onMovePrevRequest = () => {
    const { photoIndex, imageUrls } = this.state;

    return photoIndex > 0 && this.setState({
      photoIndex: ((photoIndex + imageUrls.length) - 1) % imageUrls.length,
    });
  };

  onMoveNextRequest = () => {
    const { photoIndex, imageUrls } = this.state;

    return photoIndex < imageUrls.length - 1 && this.setState({
      photoIndex: (photoIndex + 1) % imageUrls.length,
    });
  };

  fetchImageUrls = async () => {
    this.setState({ isLoading: true });
    const { modalData: { sources } } = this.props;

    const promiseSources = map(sources, (source) => new Promise((resolve, reject) => fetchImageUrl(source, undefined, (url) => resolve(url), (err) => reject(err))));

    const [...imageUrls] = await Promise.all(promiseSources);

    this.setState({ imageUrls, isLoading: false });
  };

  render() {
    const { onModalClose } = this.props;
    const { isLoading, imageUrls, photoIndex } = this.state;
    const nextSrc = photoIndex < imageUrls.length - 1 ? imageUrls[(photoIndex + 1) % imageUrls.length] : undefined;
    const prevSrc = photoIndex > 0 ? imageUrls[((photoIndex + imageUrls.length) - 1) % imageUrls.length] : undefined;

    return (
      !isLoading && (
      <Lightbox
        mainSrc={imageUrls[photoIndex]}
        nextSrc={nextSrc}
        prevSrc={prevSrc}
        onCloseRequest={onModalClose}
        onMovePrevRequest={this.onMovePrevRequest}
        onMoveNextRequest={this.onMoveNextRequest}
        enableZoom={false}
        clickOutsideToClose
        reactModalStyle={customStyles}
        wrapperClassName="image-viewer"
      />
      )
    );
  }
}

ImageViewer.propTypes = {
  onModalClose: PropTypes.func.isRequired,
  modalData: PropTypes.shape({
    sources: PropTypes.arrayOf(PropTypes.shape({
      file_key: PropTypes.string.isRequired,
      file_type: PropTypes.string.isRequired,
      file_prefix: PropTypes.string,
    })).isRequired,
    currentIndex: PropTypes.number,
  }).isRequired,
};

export default ImageViewer;
