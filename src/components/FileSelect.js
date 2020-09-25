import React from 'react';
import PropTypes from 'prop-types';
import { UPLOAD_TYPES } from '../utils/media';
import FileSelectInput from './FileSelectInput';

class FileSelect extends React.PureComponent {
  handleClick = (e) => {
    e.target.value = '';
  };

  handleSelect = (e) => {
    this.props.onSelect(e.target.files);
  };

  render() {
    const { multiple } = this.props;

    return (
      <label className="mb-0">
        <div className="image-select d-flex justify-content-center align-items-center">
          <i className="fa fa-link" />
          <FileSelectInput
            fileTypes="*"
            multiple={multiple}
            onChange={this.handleSelect}
            onClick={this.handleClick}
          />
        </div>
      </label>
    );
  }
}

FileSelect.propTypes = {
  onSelect: PropTypes.func,
  multiple: PropTypes.bool,
};

FileSelect.defaultProps = {
  onSelect: () => {},
  multiple: true,
};

export default FileSelect;
