import React from 'react';
import PropTypes from 'prop-types';

class AddMoreFile extends React.PureComponent {
  handleClick = (e) => e.target.value = '';

  handleSelect = (e) => this.props.onSelect(e.target.files);

  render() {
    return (
      <label className="gallery__image--add-more--wrapper mb-0" htmlFor="image-input-more">
        <div className="gallery__image gallery__image--add-more">
          <i className="fa fa-plus" />
          <input
            id="image-input-more"
            type="file"
            style={{ display: 'none' }}
            accept={this.props.accept}
            multiple
            onChange={this.handleSelect}
            onClick={this.handleClick}
          />
        </div>
      </label>
    );
  }
}

AddMoreFile.propTypes = {
  onSelect: PropTypes.func,
  accept: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string
  ]).isRequired,
};

AddMoreFile.defaultProps = {
  onSelect: () => {},
};

export default AddMoreFile;
