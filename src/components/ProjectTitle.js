import PropTypes from 'prop-types';

const ProjectTitle = ({ title, tagLine }) => `${title}${(tagLine || '') && (title.endsWith(':') ? ` ${tagLine}` : `: ${tagLine}`)}`;

ProjectTitle.propTypes = {
  title: PropTypes.string,
  tagLine: PropTypes.string,
};

export default ProjectTitle;
