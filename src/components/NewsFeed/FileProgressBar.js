import React from 'react';
import PropTypes from 'prop-types';

const FileProgressBar = ({ loaded }) => (
  <div className="progress-bar border">
    <div className="progress-bar__loaded" style={{ width: `${loaded}%` }} />
  </div>
);

FileProgressBar.propTypes = {
  loaded: PropTypes.number,
};

FileProgressBar.defaultProps = {
  loaded: 0,
};

export default FileProgressBar;
