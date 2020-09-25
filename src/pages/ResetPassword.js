import * as React from 'react';
import Auth from '@aws-amplify/auth';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import EmailForm from 'components/ResetPassword/EmailForm';
import SuccessMessage from 'components/ResetPassword/SuccessMessage';
import ResetPasswordForm from 'components/ResetPassword/ResetPasswordForm';
import makePageTitle from 'utils/common';

const logger = new Logger('pages/ResetPassword');


class ResetPassword extends React.Component {
  state = {
    error: null,
    loading: false,
    step: 'email',
    email: null,
    code: null,
    password: null,
  };

  componentDidMount() {
    document.title = makePageTitle('Reset password');
  }

  handleEmailValidation = (event) => {
    event.preventDefault();
    this.setState({ loading: true });
    const email = event.target.email.value.trim().toLowerCase();
    this.setState({ email }, () => {
      Auth.forgotPassword(this.state.email)
        .then((data) => {
          logger.debug(data);
          this.setState({ step: 'code_password', error: null, loading: false });
        })
        .catch((error) => {
          logger.error(error);
          this.setState({ error, loading: false });
        });
    });
  };

  handleVerificationCode = (event) => {
    event.preventDefault();
    const code = event.target.code.value;
    if (code) {
      this.setState({ code, step: 'password' });
    }
  };

  handleResetPassword = (event) => {
    event.preventDefault();
    this.setState({ loading: true });
    const { code, password } = event.target;
    this.setState({
      code: code.value,
      password: password.value,
    }, () => { this.submitResetPassword(); });
  };

  submitResetPassword() {
    const { email, code, password } = this.state;
    Auth.forgotPasswordSubmit(email, code, password)
      .then((data) => {
        logger.debug('submitResetPassword', data);
        this.setState({ step: 'succeeded', error: null, loading: false });
      })
      .catch((error) => {
        logger.error(error);
        this.setState({ error, loading: false });
      });
  }

  withLayout(title, content) {
    const { error } = this.state;
    let message;
    if (error) {
      if (error.code === 'UserNotFoundException') {
        message = 'We can\'t find any account with the email you provide.';
      } else {
        // eslint-disable-next-line
        message = error.message;
      }
    }
    return (
      <div className="sign-up text-center">
        <div className="sign-up--main-text">{title}</div>
        <div className="sign-up--card welcome-page">
          {message && <p className="alert alert-danger">{message}</p>}
          {content}
        </div>
      </div>
    );
  }

  render() {
    const { step, loading } = this.state;
    if (step === 'code_password') {
      return this.withLayout(
        'Reset Password', (
          <ResetPasswordForm loading={loading} action={this.handleResetPassword} />
        ),
      );
    } if (step === 'succeeded') {
      return this.withLayout(
        'Password Updated', (
          <SuccessMessage />
        ),
      );
    }
    return this.withLayout(
      'Reset Password', (
        <EmailForm loading={loading} action={this.handleEmailValidation} />
      ),
    );
  }
}

export default ResetPassword;
