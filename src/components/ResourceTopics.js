import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const ResourceTopics = (props) => (
  <>
    <div className="sidebar-button menu mt-3">
      <i className="fa fa-file-text-o fa-lg mr-2" />
      TOPICS
    </div>
    {props.topics.length > 0 && props.topics.map((topic) => (
      <div
        key={topic.id}
        className={clsx(
          'sidebar-filter-item pointer',
          { active: props.topicFilter === topic.slug },
        )}
        onClick={() => props.handleChangeTopic(topic.slug)}
      >
        {topic.name}
        {props.topicFilter === topic.slug
          && <i className="fa fa-check pull-right mr-2 mt-1" />}
      </div>
    ))}
  </>
);

ResourceTopics.propTypes = {
  topics: PropTypes.arrayOf(PropTypes.object),
  topicFilter: PropTypes.string,
};

export default ResourceTopics;
