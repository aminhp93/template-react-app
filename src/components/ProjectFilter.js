import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const ProjectFilter = (props) => (
  <div className="menu filer-menu project-filter">
    <div
      className={clsx('tab', { active: !props.filtered })}
      onClick={props.filtered ? props.onRemoveFilter : () => {}}
    >
      <span
        className="tab-text"
        id="allProjectsFilter"
      >
        All projects
      </span>
    </div>
    <div
      className={clsx('tab', { active: props.filtered, disabled: props.disabled })}
      onClick={(!props.filtered && !props.disabled) ? props.onAddFilter : () => {}}
    >
      <span
        className="tab-text"
        id="projectsBySessionFilter"
      >
        Projects from my sessions
      </span>
    </div>
  </div>
);

ProjectFilter.propTypes = {
  onRemoveFilter: PropTypes.func.isRequired,
  onAddFilter: PropTypes.func.isRequired,
  filtered: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default ProjectFilter;
