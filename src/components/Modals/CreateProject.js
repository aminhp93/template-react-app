import React from 'react';
import { connect } from 'react-redux';
import { changeInput } from 'actions/projectForm';
import PropTypes from 'prop-types';
import InputErrorMessage from 'components/InputErrorMessage';
import Modal from 'components/Modal';
import history from 'utils/history';

class CreateProject extends React.Component {
  state = {
    error: {},
  };

  handleFormChange = (e) => {
    this.props.changeInput(e.target.name, e.target.value);
  };

  handleChange = (name, value) => {
    this.props.changeInput(name, value);
  };

  handleCreateClick = () => {
    const isFormValid = this.validateInput(this.props.project);
    if (isFormValid) return;

    this.props.onModalClose();
    history.push('/projects/create');
  };

  validateInput = (project) => {
    const error = {};

    if (project.title === '') {
      error.title = 'Please provide the project title.';
    }

    this.setState({ error });
    return Object.keys(error).length > 0;
  };

  render() {
    const { project } = this.props;
    const { error } = this.state;
    return (
      <Modal close={this.props.onModalClose}>
        <div id="createProjectModal">
          <div className="text-center mb-1"><b>CREATE NEW PROJECT</b></div>
          <p className="text-center page-description mb-4">Share your ideas with other fellows</p>
          <div className="form-group">
            <label className="form-control-label">PROJECT NAME</label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={project.title}
              onChange={this.handleFormChange}
            />
            {error.title && <InputErrorMessage>{error.title}</InputErrorMessage>}
          </div>
          <div className="text-center">
            <button
              id="createProjectModalCreateButton"
              className="btn btn-primary my-3 mx-auto"
              onClick={this.handleCreateClick}
            >
              CREATE
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}

CreateProject.propTypes = {
  onModalClose: PropTypes.func.isRequired,
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateProject);
