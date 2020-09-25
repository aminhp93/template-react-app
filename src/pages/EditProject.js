import React from 'react';
import { connect } from 'react-redux';
import ProjectForm from 'components/ProjectForm';
import PropTypes from 'prop-types';
import ProjectService from 'services/Project';
import { initFormData, resetForm } from 'actions/projectForm';
import history from 'utils/history';
import LoadingIndicator from 'components/LoadingIndicator';
import makePageTitle from 'utils/common';

import { Logger } from '@aws-amplify/core'

const logger = new Logger(__filename)

class EditProject extends React.Component {
  state = {
    fetching: false,
  };

  componentDidMount() {
    this.fetchProjectInfo();
    document.title = makePageTitle('Edit Project');
  }

  componentWillUnmount() {
    this.props.resetForm();
  }

  fetchProjectInfo() {
    const { slug } = this.props.match && this.props.match.params;
    if (!slug) history.push('/projects');
    this.setState({ fetching: true });
    ProjectService.getProjectBySlug(slug).then((res) => {
      if (res.data) {
        this.setState({
          fetching: false,
        });
        const project = res.data;
        if (project.technologies) project.technologies = project.technologies.split(',');
        if (project.session) project.session_id = project.session.id;
        this.props.initFormData(project);
      } else {
        history.push('/projects');
      }
    }).catch((e) => {
      history.push('/projects');
      logger.error(e);
    });
  }

  render() {
    const { fetching } = this.state;
    return (
      <div className="main-page">
        <h1 className="text-center page-title my-5" id="editProjectTitle">Edit Project</h1>
        <div className="container project-form">
          {fetching ? (
            <LoadingIndicator />
          ) : (
            <ProjectForm />
          )}
        </div>
      </div>
    );
  }
}

EditProject.propTypes = {
  match: PropTypes.objectOf(PropTypes.any),
  initFormData: PropTypes.func.isRequired,
  resetForm: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  initFormData: (data) => { dispatch(initFormData(data)); },
  resetForm: () => { dispatch(resetForm()); },
});

export default connect(null, mapDispatchToProps)(EditProject);
