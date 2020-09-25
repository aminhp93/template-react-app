import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { resetForm } from 'actions/projectForm';
import ProjectForm from 'components/ProjectForm';
import makePageTitle from 'utils/common';

class CreateProject extends React.Component {
  componentDidMount() {
    document.title = makePageTitle('Create Project');
  }

  componentWillUnmount() {
    this.props.resetForm();
  }

  render() {
    return (
      <div className="main-page">
        <h1 className="text-center page-title my-5" id="createProjectTitle">Create new project</h1>
        <div className="container project-form">
          <ProjectForm />
        </div>
      </div>
    );
  }
}

CreateProject.propTypes = {
  resetForm: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  resetForm: () => { dispatch(resetForm()); },
});

export default connect(null, mapDispatchToProps)(CreateProject);
