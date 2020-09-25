import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { Link } from 'react-router-dom';

import { getDateFromTimeString } from 'utils/time';
import ProjectService from 'services/Project';
import emitter, { EVENT_KEYS } from 'utils/event';
import { makeFullUrl } from 'utils/url';

const Project = ({ project }) => {
  const { slug, title, modified, description, slide_url, codebase_url } = project
  return (
    <div className="card text-left border-none">
    <div className="project-header">
      <Link
        to={`/projects/${slug}`}
        onClick={() => emitter.emit(EVENT_KEYS.VIEW_PROJECT, { project_name: title })}
      >
        <b>{title}</b>
      </Link>
      <div className="project-date">
        {getDateFromTimeString(modified)}
      </div>
    </div>
    <div className="project-description">{description}</div>
    {
      description
      && (
        <div className="project-link">
          <a href={makeFullUrl(slide_url)} target="_blank" rel="noreferrer" className="text-link" style={{ marginRight: '1.5em' }}>Slide</a>
          <a href={makeFullUrl(codebase_url)} target="_blank" rel="noreferrer" className="text-link">Codebase</a>
        </div>
      )
    }
  </div>
  )
}


const ProjectList = ({ projects }) => {
  const projectList = projects && projects.length > 0 && projects.map((project, index) => (
    <React.Fragment key={project.id}>
      {index > 0 && <hr />}
      <Project project={project} />
    </React.Fragment>
  ));
  return projectList || <div className="text-center">No project</div>;
};

interface IProps {
  selectedProfile: any,
  authUser: any
}

interface IState {
  projects: any,
}

class ProfileProjectTab extends React.Component<IProps, IState> {
  state = {
    projects: [],
  };

  componentDidMount() {
    const { selectedProfile, authUser } = this.props;
    const id = selectedProfile ? selectedProfile.id : authUser.id;
    ProjectService.getProjectsByUserId(id).then((res) => {
      if (res.data && res.data.results) {
        this.setState({ projects: res.data.results });
      }
    });  
  }

  render = () => (
    <ProjectList projects={this.state.projects} />
  );
}

const mapStateToProps = (state) => {
  return {
    selectedProfile: get(state, 'selectedProfile'),
    authUser: get(state, 'authUser') || {}
  };
};

export default connect(mapStateToProps, null)(ProfileProjectTab);

