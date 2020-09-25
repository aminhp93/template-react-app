import config from 'config';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  DEFAULT_IMAGE, getImageURL,
} from 'utils/media';
import { IMAGE_SIZES } from 'constants/common';

class Image extends PureComponent {
  constructor(props) {
    super(props);
    const { source, size } = props;
    let imageUrl = null;
    if (source.file_key.includes(config.cloudFrontEndpoint.url)) {
      imageUrl = source.file_key;
    } else if (source.file_key.includes(source.file_prefix)) {
      imageUrl = getImageURL(source.file_key, this.edits(size));
    } else {
      imageUrl = getImageURL(source.file_prefix + source.file_key, this.edits(size));
    }
    this.state = {
      src: imageUrl,
    };
  }

  componentDidMount() {
    this.show();
  }

  componentWillReceiveProps(nextProps) {
    const { source } = this.props;
    if (source.file_key !== nextProps.source.file_key) {
      let imageUrl = null;
      if (nextProps.source.file_key.includes(config.cloudFrontEndpoint.url)) {
        imageUrl = nextProps.source.file_key;
      } else if (nextProps.source.file_key.includes(source.file_prefix)) {
        imageUrl = getImageURL(nextProps.source.file_key, this.edits(nextProps.size));
      } else {
        imageUrl = getImageURL(nextProps.source.file_prefix + nextProps.source.file_key, this.edits(nextProps.size));
      }
      this.setState({ src: imageUrl }, () => this.show());
    }
  }

  show = () => {
    const { src } = this.state;
    const { increaseLoadedImagesCount } = this.props;
    const imageLoader = new window.Image();
    imageLoader.src = src;
    imageLoader.onload = () => {
      const ratioWH = imageLoader.width / imageLoader.height;

      if (this.image) {
        this.image.setAttribute('src', src);
        this.image.setAttribute('width', '300px');
        this.image.setAttribute('height', `${300 / ratioWH}px`);
      }
      increaseLoadedImagesCount();
    };
  };

  edits = (size) => ({
    resize: {
      width: size.width,
      height: size.height,
      fit: 'inside',
    },
    rotate: null
  });

  render() {
    const {
      source, fullPage, className, onClick,
    } = this.props;

    return (
      <div
        className={`image-layout--image ${fullPage ? 'image-medium' : 'image-small'}`}
      >
        <img
          ref={(image) => this.image = image}
          src={DEFAULT_IMAGE}
          alt={source.file_key}
          className={className}
          onClick={onClick}
        />
      </div>
    );
  }
}

Image.propTypes = {
  source: PropTypes.shape({
    file_key: PropTypes.string.isRequired,
    file_type: PropTypes.string.isRequired,
    file_prefix: PropTypes.string,
  }).isRequired,
  size: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }),
  onClick: PropTypes.func,
  fullPage: PropTypes.bool,
  className: PropTypes.string,
  increaseLoadedImagesCount: PropTypes.func,
};

Image.defaultProps = {
  fullPage: false,
  className: '',
  size: IMAGE_SIZES.normal,
  increaseLoadedImagesCount: () => {},
};

export default Image;
