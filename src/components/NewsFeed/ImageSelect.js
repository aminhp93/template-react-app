import React from 'react';
import PropTypes from 'prop-types';
import { generateRandomState } from 'utils/random';
import { IMAGE_TYPES } from '../../utils/media';

class ImageSelect extends React.PureComponent {
  constructor(props) {
    super(props);
    this.key = generateRandomState();
  }

  handleClick = (e) => {
    e.target.value = '';
  };

  handleSelect = (e) => {
    this.props.onSelect(e.target.files);
  };

  render() {
    const { multiple } = this.props;

    return (
      <label className="mb-0" htmlFor={this.key}>
        <div className="image-select d-flex justify-content-center align-items-center">
          <i className="fa fa-image" />
          <input
            id={this.key}
            type="file"
            style={{ display: 'none' }}
            accept={IMAGE_TYPES}
            multiple={multiple}
            onChange={this.handleSelect}
            onClick={this.handleClick}
          />
        </div>
      </label>
    );
  }
}

ImageSelect.propTypes = {
  onSelect: PropTypes.func,
  multiple: PropTypes.bool,
};

ImageSelect.defaultProps = {
  onSelect: () => {},
  multiple: true,
};

export default ImageSelect;
