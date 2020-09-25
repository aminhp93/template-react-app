import React from 'react';
import PropTypes from 'prop-types';

const Tag = (props) => (
  <div className="tag">
    <span className="search-term">{props.tag.title}</span>
    <i className="fa fa-times" onClick={() => props.onRemoveTag(props.tag)} />
  </div>
);

Tag.propTypes = {
  tag: PropTypes.objectOf(PropTypes.any),
  onRemoveTag: PropTypes.func,
};

export default Tag;
