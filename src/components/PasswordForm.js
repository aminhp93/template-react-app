import React from 'react';
import PropTypes from 'prop-types';
import UserInfo from 'utils/userInfo';

class PasswordForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        password: '',
        confirmPassword: '',
      },
      error: null,
    };
  }

  onFormSubmit = (e) => {
    e.preventDefault();
    const fields = { ...this.state.fields };
    const error = this.validate(fields);
    if (error) {
      this.setState({ error });
    } else {
      this.setState({ error: null });
      this.props.onSubmit(fields.password);
    }
  };

  validate = ({ password, confirmPassword }) => {
    let error = null;
    if (password !== confirmPassword) error = 'Passwords do not match.';
    if (confirmPassword === '') error = 'Please confirm your password.';
    if (password.length < 8) error = 'Password should have at least 8 characters.';
    if (password === '') error = 'Please enter a password.';
    return error;
  };

  handleInputChange = (e) => {
    const fields = { ...this.state.fields };
    fields[e.target.name] = e.target.value;
    this.setState({ fields });
  };

  render() {
    const { error, fields } = this.state;
    const { submitting } = this.props;
    return (
      <>
        <div className="row mx-2 text-left">
          <div className="col-sm-6">
            <b>Name</b>
          </div>
          <div className="col-sm-6">
            {UserInfo.getUserName()}
          </div>
          <div className="col-sm-6">
            <b>LinkedIn Email</b>
          </div>
          <div className="col-sm-6">
            {UserInfo.getLinkedInEmail()}
          </div>
        </div>
        <hr />
        <form
          onSubmit={this.onFormSubmit}
        >
          <input
            className="form-control mt-4 mb-3 sign-up--input"
            type="password"
            name="password"
            placeholder="Password"
            value={fields.password}
            onChange={this.handleInputChange}
          />
          <input
            className="form-control mt-4 mb-3 sign-up--input"
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={fields.confirmPassword}
            onChange={this.handleInputChange}
          />
          <div className="text-danger mb-2 text-left ml-4">{error}</div>
          <button
            type="submit"
            className="btn btn-submit mt-3"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Confirm'}
          </button>
        </form>
      </>
    );
  }
}

PasswordForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export default PasswordForm;
