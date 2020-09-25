import React from 'react';
import PropTypes from 'prop-types';
import Project from './Project';

const ProjectList = (props) => {
  const projectList = props.projects && props.projects.map((project) => (
    <Project
      key={project.id}
      {...project}
    />
  ));
  return (
    <div id="project-table" className="section listing user-list">
      <div className="row">
        <table className="table table-responsive">
          <thead className="bg-light">
            <tr>
              <th className="text-center" style={{ width: '18%' }}>Owner</th>
              <th className="pl-3" style={{ width: '64%', minWidth: '250px' }}>Projects</th>
              <th className="pr-2 text-left" style={{ width: '18%', minWidth: '180px' }}>Presentation</th>
            </tr>
          </thead>
          <tbody>
            {projectList}
          </tbody>
        </table>
      </div>
    </div>
  );
};

ProjectList.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ProjectList;
