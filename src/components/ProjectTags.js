import React from 'react';
import PropTypes from 'prop-types';

const ProjectTags = ({ tags }) => ((tags && tags.length > 0) ? `tags: ${tags.split(', ').map((tag) => tag && ` #${tag}`)}` : <i>No tags found</i>);

ProjectTags.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.object),
};

export default ProjectTags;
