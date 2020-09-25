import React from 'react';
import PropTypes from 'prop-types';
import Tag from './Tag';

const TagList = (props) => {
  const tagList = props.tagList && props.tagList.map((tag) => (
    <Tag key={`${tag.type}${tag.id}`} tag={tag} onRemoveTag={props.onRemoveTag} />
  ));
  return (
    <div className="tag-row">
      <div className="currently-showing">
        {tagList}
        <a className="clear-all-tag pull-right" onClick={props.onRemoveAllTags}>
          Clear all
        </a>
      </div>
    </div>
  );
};

TagList.propTypes = {
  tagList: PropTypes.arrayOf(PropTypes.object),
  onRemoveTag: PropTypes.func,
  onRemoveAllTags: PropTypes.func,
};

export default TagList;
