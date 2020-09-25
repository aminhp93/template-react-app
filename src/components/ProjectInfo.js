import React from 'react';
import toastr from 'toastr';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { DEFAULT_PROFILE_IMAGE_URL } from 'constants/common';
import history from 'utils/history';
import userInfo from 'utils/userInfo';
import { getDateFromTimeString } from 'utils/time';
import { makeFullUrl } from 'utils/url';
import ProjectService from 'services/Project';
import Tabs from 'components/Tabs';
import LoadingIndicator from 'components/LoadingIndicator';
import ProjectTitle from 'components/ProjectTitle';
import ProjectTags from 'components/ProjectTags';
import ConfirmDelete from 'components/Modals/ConfirmDelete';
import makePageTitle from 'utils/common';

import { Logger } from '@aws-amplify/core'

const logger = new Logger(__filename)

class ProjectInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projectDetail: {},
      tabs: [{
        id: 1,
        title: 'SUMMARY',
        render: this.renderSummaryTab,
      }, {
        id: 2,
        title: 'DATA',
        render: this.renderDataTab,
      }],
      fetching: false,
      confirmDelete: false,
    };
  }

  componentDidMount() {
    const user = userInfo.getUserInfo() || {};
    if (!user.is_approved) history.push('/projects');
    this.fetchProjectInfo();
  }

  fetchProjectInfo() {
    const { slug } = this.props.match && this.props.match.params;
    if (!slug) history.push('/projects');
    this.setState({ fetching: true });
    ProjectService.getProjectBySlug(slug).then((res) => {
      if (res.data) {
        this.setState({
          projectDetail: res.data,
          fetching: false,
        }, () => {
          document.title = makePageTitle(this.state.projectDetail.title);
        });
      } else {
        history.push('/projects');
      }
    }).catch((e) => {
      history.push('/projects');
      logger.error(e);
    });
  }

  deleteProject = () => {
    ProjectService.deleteProjectBySlug(this.state.projectDetail.slug).then(() => {
      this.hideConfirmDelete();
      history.push('/projects');
      toastr.success('Project is deleted.');
    });
  };

  showConfirmDelete = () => this.setState({ confirmDelete: true });

  hideConfirmDelete = () => this.setState({ confirmDelete: false });

  renderSummaryTab = () => {
    const { projectDetail } = this.state;
    return (
      <div className="tab-pane active">
        <div className="mb-2 mt-4">
          <b className="text-secondary">TECHNOLOGIES</b>
        </div>
        {projectDetail.technologies && projectDetail.technologies.split(',').map((tech) => (
          <span key={tech} className="technology-tag">{tech}</span>
        ))}
        <div className="mb-2 mt-4">
          <b className="text-secondary">PROBLEM STATEMENT</b>
        </div>
        <p id="projectproblemStatement">{projectDetail.description}</p>
        <div className="mb-2 mt-4">
          <b className="text-secondary">SOLUTION</b>
        </div>
        <p id="projectSolution">{projectDetail.solution}</p>
        <div className="mb-2 mt-4">
          <b className="text-secondary">PRESENTATION LINK</b>
        </div>
        <p id="problemPresentationLink">
          {projectDetail.slide_url
            && (
            <a className="user-projects--link" target="_blank" rel="noreferrer" href={makeFullUrl(projectDetail.slide_url)}>
              {makeFullUrl(projectDetail.slide_url)}
            </a>
            )}
        </p>
        <div className="mb-2 mt-4">
          <b className="text-secondary">DEMO LINK</b>
        </div>
        <p id="problemDemoLink">
          {projectDetail.demo_url
            && (
            <a className="user-projects--link" target="_blank" rel="noreferrer" href={makeFullUrl(projectDetail.demo_url)}>
              {makeFullUrl(projectDetail.demo_url)}
            </a>
            )}
        </p>
        <div className="mb-2 mt-4">
          <b className="text-secondary">CODEBASE LINK</b>
        </div>
        <p id="problemCodebaseLink">
          {projectDetail.codebase_url
            && (
            <a className="user-projects--link" target="_blank" rel="noreferrer" href={makeFullUrl(projectDetail.codebase_url)}>
              {makeFullUrl(projectDetail.codebase_url)}
            </a>
            )}
        </p>
      </div>
    );
  };

  renderDataTab = () => {
    const { dataset } = this.state.projectDetail;
    return (
      <div className="tab-pane active">
        {dataset
          && (
            <>
              <div className="mb-2 mt-4">
                <b className="text-secondary">DATA NAME</b>
              </div>
              <p id="projectDataName">{dataset.name}</p>
              <div className="mb-2 mt-4">
                <b className="text-secondary">DATA LINK</b>
              </div>
              <p id="projectDataLink">
                {dataset.link
                && (
                <a className="user-projects--link" href={makeFullUrl(dataset.link)} target="_blank" rel="noreferrer">
                  {dataset.name || makeFullUrl(dataset.link)}
                </a>
                )}
              </p>
              <div className="mb-2 mt-4">
                <b className="text-secondary">ABOUT</b>
              </div>
              <p id="projectDataAbout">{dataset.description}</p>
            </>
          )}
      </div>
    );
  };

  render() {
    const { projectDetail } = this.state;
    return (
      <div className="project-details--container">
        <Link to="/projects">
          <i className="fa fa-arrow-left" />
          {' '}
          Back to project directory
        </Link>
        {this.state.fetching && <LoadingIndicator />}
        {projectDetail && Object.keys(projectDetail).length > 0
        && (
        <div className="card mt-3">
          <div className="row">
            <div className="col-md-2 col-sm-3 px-5 pt-4 text-center">
              {(!projectDetail.owner) ? (
                <img
                  className="profile--image"
                  src={DEFAULT_PROFILE_IMAGE_URL}
                  width="100px"
                  alt="Alumni"
                />
              ) : (
                <Link className="profile--image--tooltip" to={`/profile/${projectDetail.owner.id}`}>
                  <img
                    className="profile--image pointer"
                    src={projectDetail.owner.profile_image || DEFAULT_PROFILE_IMAGE_URL}
                    width="80px"
                    alt="Alumni"
                  />
                  {/* <span className="profile--image--tooltiptext">
                    {projectDetail.owner.first_name} {projectDetail.owner.last_name}
                  </span> */}
                  <div className="text-center mt-2">
                    {projectDetail.owner.first_name}
                    {' '}
                    {projectDetail.owner.last_name}
                    <br />
                    {projectDetail.session_name
                      && `${projectDetail.session_name}.${projectDetail.session_program}.${projectDetail.session_location}`}
                  </div>
                </Link>
              )}
            </div>
            <div className="col-md-10 col-sm-9">
              <div className="d-flex">
                <div className="project-details--title">
                  <ProjectTitle title={projectDetail.title} tagLine={projectDetail.tag_line} />
                </div>
                <div className="project-details--date">
                  {getDateFromTimeString(projectDetail.modified)}
                </div>
              </div>
              <div className="project-details--session mt-2">
                {projectDetail.session
                  ? (
                    <>
                      <span>Project session: </span>
                      <span>
                        {projectDetail.session.name}
                        .
                        {' '}
                      </span>
                      <span>
                        {projectDetail.session.program.name}
                        .
                        {' '}
                      </span>
                      <span>{projectDetail.session.location.address}</span>
                    </>
                  )
                  : <span>No session</span>}
              </div>
              <hr className="project-details--title-break" />
              <div className="project-details--tags">
                <ProjectTags tags={projectDetail.tags} />
                {projectDetail.owner && projectDetail.owner.id === userInfo.getUserInfo().id
                  && (
                    <>
                      <Link to={`/projects/${projectDetail.slug}/edit`} className="project-details--edit-icon text-secondary">
                        <i className="fa fa-edit fa-lg" />
                      </Link>
                      <span className="project-details--delete-icon text-secondary" onClick={this.showConfirmDelete}>
                        <i className="fa fa-trash fa-lg" />
                      </span>
                    </>
                  )}
              </div>
            </div>
          </div>
          <hr className="mb-0" />
          <Tabs tabs={this.state.tabs} padding />
        </div>
        )}
        {this.state.confirmDelete
        && (
        <ConfirmDelete
          isOpen={this.state.confirmDelete}
          close={this.hideConfirmDelete}
          delete={this.deleteProject}
          targetType="project"
          targetName={projectDetail.title}
        />
        )}
      </div>
    );
  }
}

ProjectInfo.propTypes = {
  match: PropTypes.objectOf(PropTypes.any),
};

export default ProjectInfo;
