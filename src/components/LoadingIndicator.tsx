import * as React from 'react';
import PropTypes from 'prop-types';

const LoadingIndicator = ({ containerClass }) => (
  <div className={`spinner ${containerClass}`}>
    <div className="bounce1" />
    <div className="bounce2" />
    <div className="bounce3" />
    <div className="bounce4" />
  </div>
);

LoadingIndicator.propTypes = {
  containerClass: PropTypes.string,
};

LoadingIndicator.defaultProps = {
  containerClass: '',
};

export default LoadingIndicator;
