import * as React from 'react';
import * as PropTypes from 'prop-types';
import clsx from 'clsx';
import LoadingIndicator from 'components/LoadingIndicator';
import makePageTitle from 'utils/common';


class ResetPasswordForm extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
    action: PropTypes.func.isRequired,
  };

  state = {
    password: '',
    passwordTyped: false,
    passwordConfirmation: '',
    passwordContainNumber: false,
    passwordHasCorrectLength: false,
    passwordContainUppercase: false,
    passwordMatchConfirmation: false,
  };

  componentDidMount = () => {
    document.title = makePageTitle('New password');
  };

  onCodeChanged = (event) => {
    const code = event.target.value;
    const re = /^[0-9\b]+$/;
    if (code === '' || re.test(code)) {
      this.setState({ code });
    }
  };

  onPasswordChanged = (e) => {
    const password = e.target.value;
    this.setState({ password, passwordTyped: true }, () => {
      this.validatePassword();
    });
  };

  onConfirmationChanged = (e) => {
    const passwordConfirmation = e.target.value;
    this.setState({ passwordConfirmation, passwordTyped: true }, () => {
      this.validatePassword();
    });
  };

  isPasswordHasCorrectLength = (password) => password.length >= 8;

  isPasswordContainUppercase = (password) => /[A-Z]/.test(password);

  isPasswordContainNumber = (password) => /[0-9]/.test(password);

  validatePassword = () => {
    const { password, passwordConfirmation } = this.state;
    this.setState({ passwordHasCorrectLength: this.isPasswordHasCorrectLength(password) });
    this.setState({ passwordContainUppercase: this.isPasswordContainUppercase(password) });
    this.setState({ passwordContainNumber: this.isPasswordContainNumber(password) });
    this.setState({ passwordMatchConfirmation: password && password === passwordConfirmation });
  };

  render() {
    const {
      code,
      password,
      passwordTyped,
      passwordConfirmation,
      passwordHasCorrectLength,
      passwordContainNumber,
      passwordContainUppercase,
      passwordMatchConfirmation,
    } = this.state;
    const isValid = passwordHasCorrectLength && passwordContainNumber
      && passwordContainUppercase && passwordMatchConfirmation && code;
    const isValidPassword = passwordHasCorrectLength && passwordContainNumber
      && passwordContainUppercase;
    const { loading, action } = this.props;
    return (
      <form onSubmit={action} method="POST">
        <div className="text-left form-group">
          <p>Please enter the verification code sent to your email to reset your password.</p>
          <label htmlFor="code" className="font-weight-bold">Code</label>
          <input
            type="text"
            name="code"
            id="code"
            placeholder="Enter code"
            className="form-control"
            value={code}
            onChange={(e) => this.onCodeChanged(e)}
          />
        </div>
        <div className="text-left form-group">
          <p className="mb-1">A valid password must</p>
          <ul className="password-checklist">
            <li
              className={clsx(
                { 'text-danger': passwordTyped && !passwordHasCorrectLength },
                { 'text-success': passwordTyped && passwordHasCorrectLength },
              )}
            >
              <span>Be at least 8 characters long</span>
            </li>
            <li
              className={clsx(
                { 'text-danger': passwordTyped && !passwordContainUppercase },
                { 'text-success': passwordTyped && passwordContainUppercase },
              )}
            >
              <span>Have at least one uppercase character</span>
            </li>
            <li
              className={clsx(
                { 'text-danger': passwordTyped && !passwordContainNumber },
                { 'text-success': passwordTyped && passwordContainNumber },
              )}
            >
              <span>Have at least one number</span>
            </li>
            <li
              className={clsx(
                { 'text-danger': passwordTyped && !passwordMatchConfirmation },
                { 'text-success': passwordTyped && passwordMatchConfirmation },
              )}
            >
              <span>Match with password confirmation</span>
            </li>
          </ul>
        </div>
        <div className="text-left mb-4">
          <label htmlFor="password" className="font-weight-bold">New password</label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            placeholder="Enter password"
            className={clsx('form-control', { 'is-invalid': passwordTyped && !isValidPassword })}
            onChange={(e) => this.onPasswordChanged(e)}
          />
        </div>
        <div className="text-left mb-4">
          <label htmlFor="passwordConfirmation" className="font-weight-bold">Confirm password</label>
          <input
            type="password"
            name="passwordConfirmation"
            id="passwordConfirmation"
            placeholder="Confirm password"
            value={passwordConfirmation}
            className={clsx('form-control', { 'is-invalid': passwordTyped && !passwordMatchConfirmation })}
            onChange={(e) => this.onConfirmationChanged(e)}
          />
        </div>
        {loading ? <LoadingIndicator /> : (
          <button
            id="changePasswordButton"
            className="btn btn-primary btn-lg px-4 mt-2 text-uppercase"
            disabled={!isValid}
          >
            Change Password
          </button>
        )}
      </form>
    );
  }
}

export default ResetPasswordForm;
