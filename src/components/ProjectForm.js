import React from 'react';
import TagsInput from 'react-tagsinput';
import { connect } from 'react-redux';
import { changeInput } from 'actions/projectForm';
import Select from 'react-select';
import DatasetForm from 'components/DatasetForm';
import InputErrorMessage from 'components/InputErrorMessage';
import PropTypes from 'prop-types';
import ProjectService from 'services/Project';
import ProfileService from 'services/Profile';
import history from 'utils/history';
import { isValidUrl } from 'utils/validator';
import userInfo from 'utils/userInfo';
import emitter, { EVENT_KEYS } from 'utils/event';


import { Logger } from '@aws-amplify/core'

const logger = new Logger(__filename)

class ProjectForm extends React.Component {
  state = {
    error: {},
    loading: false,
    userSessions: [],
  };

  componentDidMount() {
    this.fetchUserSession();
  }

  fetchUserSession() {
    ProfileService.getSessions(userInfo.getUserId()).then((res) => {
      const userSessions = [{
        id: 0,
        title: 'No session',
      }];

      if (res && res.data && res.data.length > 0) {
        res.data.map((data) => userSessions.unshift({
          id: data.id,
          title: `${data.name} . ${data.program.name} . ${data.location.address}`,
          abbr: `${data.name}.${data.program.abbr}.${data.location.abbr}`,
        }));
      }

      this.setState({ userSessions });
    });
  }

  handleFormChange = (e) => {
    this.props.changeInput(e.target.name, e.target.value);
  };

  handleChange = (name, value) => {
    this.props.changeInput(name, value);
  };

  handleSelectSession = (session) => {
    if (session) this.props.changeInput('session_id', session.id);
  };

  validateInput = (project) => {
    const error = {};

    if (project.title === '') {
      error.title = 'Please provide the project title.';
    }
    if (!project.technologies || project.technologies.length === 0) {
      error.technologies = 'Please provide the project technologies';
    } else if (project.technologies.reduce((acc, item) => acc + item.length, 0) > 255) {
      error.technologies = 'There are some technology names are too long';
    }
    if (project.description === '') {
      error.description = 'Please provide the problem description';
    }
    if (project.slide_url === '') {
      error.slide_url = 'Please provide the presentation link';
    } else if (!isValidUrl(project.slide_url)) {
      error.slide_url = 'Please provide a valid link';
    }
    if (project.demo_url !== '' && !isValidUrl(project.demo_url)) {
      error.demo_url = 'Please provide a valid link';
    }
    if (project.codebase_url !== '' && !isValidUrl(project.codebase_url)) {
      error.codebase_url = 'Please provide a valid link';
    }
    if (project.dataset) {
      if (project.dataset.link !== '' || project.dataset.name !== '' || project.dataset.description !== '') {
        if (project.dataset.link === '') error.dataset_link = 'Please provide a link for the dataset';
        else if (!isValidUrl(project.dataset.link)) {
          error.dataset_link = 'Please provide a valid link';
        }
        if (project.dataset.name === '') error.dataset_name = 'Please provide a the name of the dataset';
      }
    }

    this.setState({ error });
    return Object.keys(error).length > 0;
  };

  handleSubmit = (action) => {
    const project = { ...this.props.project };
    const hasError = this.validateInput(project);

    if (hasError) return;
    // Transform project technology array into a comma-separated string to send to server
    project.technologies = project.technologies.join(',');
    project.session_id = project.session_id === 0 ? null : project.session_id;

    this.setState({ loading: true });
    if (action === 'create') {
      ProjectService.createProject(project).then((res) => {
        const projectSession = this.state.userSessions.filter((s) => s.id === project.session_id)[0];
        if (projectSession) {
          emitter.emit(EVENT_KEYS.CREATE_PROJECT, { session: projectSession.abbr });
        }
        history.push(`/projects/${res.data.slug}`);
      }).catch((e) => {
        this.setState({ loading: false });
        logger.error(e);
      });
    } else {
      ProjectService.editProjectBySlug(project.slug, project).then((res) => {
        emitter.emit(EVENT_KEYS.EDIT_PROJECT);
        history.push(`/projects/${res.data.slug}`);
      }).catch((e) => {
        this.setState({ loading: false });
        logger.error(e);
      });
    }
  };

  render() {
    const { error } = this.state;
    const { project } = this.props;
    return (
      <div className="form">
        <div className="card">
          <div className="card-body">
            <div id="projectFormTitle" className="form-group">
              <label className="form-control-label">
                <b className="text-secondary">PROJECT NAME</b>
              </label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={project.title}
                onChange={this.handleFormChange}
                required
              />
              <span className="text-danger form-required">(*)</span>
              {error.title && <InputErrorMessage>{error.title}</InputErrorMessage>}
            </div>
            <div id="projectFormTechnologies" className="form-group">
              <label className="form-control-label">
                <b className="text-secondary">TECHNOLOGIES</b>
              </label>
              <TagsInput
                value={project.technologies || []}
                onChange={(technologies) => this.handleChange('technologies', technologies)}
                maxTags={10}
                addOnBlur
                addOnPaste
                addKeys={[9, 13, 188]}
                inputProps={(project.technologies && project.technologies.length > 0) ? {
                  placeholder: '',
                  style: { width: 'auto' },
                } : {
                  placeholder: 'CNN, linear regression, opencv, GAN, etc',
                  style: { width: '100%' },
                }}
              />
              <span className="text-danger form-required">(*)</span>
              <span className="text-secondary form-notice">
                *Add keywords separated by commas. You can add up to 10 technologies per project.
              </span>
              {error.technologies && <InputErrorMessage>{error.technologies}</InputErrorMessage>}
            </div>
            <div id="projectFormSession" className="form-group">
              <label className="form-control-label">
                <b className="text-secondary">SESSION</b>
              </label>
              <Select
                placeholder="Type to search"
                value={project.session_id || 0}
                onChange={this.handleSelectSession}
                valueKey="id"
                labelKey="title"
                options={this.state.userSessions}
                searchable={false}
                clearable={false}
              />
              <span className="text-danger form-required">(*)</span>
            </div>
          </div>
        </div>
        <div className="mt-4 mb-2 ml-5"><b>SUMMARY</b></div>
        <div className="card">
          <div className="card-body">
            <div id="projectFormProblemStatement" className="form-group">
              <label className="form-control-label">
                <b className="text-secondary">PROBLEM STATEMENT</b>
              </label>
              <textarea
                type="text"
                name="description"
                value={project.description}
                className="form-control"
                placeholder="What is the problem you're aiming to solve? Why is it important? Who is the target audience?"
                onChange={this.handleFormChange}
              />
              <span className="text-danger form-required">(*)</span>
              {error.description && <InputErrorMessage>{error.description}</InputErrorMessage>}
            </div>
            <div id="projectFormSolution" className="form-group">
              <label className="form-control-label">
                <b className="text-secondary">SOLUTION</b>
              </label>
              <textarea
                type="text"
                name="solution"
                value={project.solution}
                className="form-control"
                placeholder="What's your solution? How does that solve the problem? What does your product / deliverable look like?"
                onChange={this.handleFormChange}
              />
            </div>
            <div id="projectFormPresentationLink" className="form-group">
              <label className="form-control-label">
                <b className="text-secondary">PRESENTATION LINK</b>
              </label>
              <input
                type="text"
                name="slide_url"
                value={project.slide_url}
                className="form-control"
                placeholder="Link to your presentation slides"
                onChange={this.handleFormChange}
              />
              <span className="text-danger form-required">(*)</span>
              {error.slide_url && <InputErrorMessage>{error.slide_url}</InputErrorMessage>}
            </div>
            <div id="projectFormDemoLink" className="form-group">
              <label className="form-control-label">
                <b className="text-secondary">DEMO LINK</b>
              </label>
              <input
                type="text"
                name="demo_url"
                value={project.demo_url}
                className="form-control"
                placeholder="Link to your demo if applicable"
                onChange={this.handleFormChange}
              />
              {error.demo_url && <InputErrorMessage>{error.demo_url}</InputErrorMessage>}
            </div>
            <div id="projectFormCodebaseLink" className="form-group">
              <label className="form-control-label">
                <b className="text-secondary">CODEBASE LINK</b>
              </label>
              <input
                type="text"
                name="codebase_url"
                value={project.codebase_url}
                className="form-control"
                placeholder="Link to your Github project"
                onChange={this.handleFormChange}
              />
              {error.codebase_url && <InputErrorMessage>{error.codebase_url}</InputErrorMessage>}
            </div>
          </div>
        </div>
        <div className="mt-4 mb-2 ml-5"><b>DATA</b></div>
        <DatasetForm
          error={error}
          dataset={project.dataset}
          onDatasetChange={(dataset) => this.handleChange('dataset', dataset)}
        />
        {Object.keys(error).length > 0
          && <div id="projectFormWarning" className="my-2 ml-5 text-danger">Please fill in all required information and correct your input</div>}
        <div className="text-right mt-3 mb-5">
          <button id="projectFormCancel" className="btn btn-light btn-lg mr-2" onClick={history.goBack}>Cancel</button>
          <button
            id="projectFormSubmit"
            className="btn btn-primary btn-lg"
            onClick={project.id ? () => this.handleSubmit('edit') : () => this.handleSubmit('create')}
            disabled={this.state.loading}
          >
            Save
          </button>
        </div>
      </div>
    );
  }
}

ProjectForm.propTypes = {
  changeInput: PropTypes.func.isRequired,
  // eslint-disable-next-line
  project: PropTypes.object,
};

const mapStateToProps = ({ projectForm }) => ({
  project: projectForm,
});

const mapDispatchToProps = (dispatch) => ({
  changeInput: (name, value) => { dispatch(changeInput(name, value)); },
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectForm);
