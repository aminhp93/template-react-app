import React from 'react';
import PropTypes from 'prop-types';


const FileSelectInput = (props) => (
  <input
    id={this.key}
    type="file"
    style={{ display: 'none' }}
    // accept={props.fileTypes}
    multiple={props.multiple}
    onChange={props.onChange}
    onClick={props.onClick}
  />
);


FileSelectInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  onClick: PropTypes.func,
  multiple: PropTypes.bool,
  fileTypes: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string
  ]),
};

FileSelectInput.defaultProps = {
  multiple: true,
};

export default FileSelectInput;
