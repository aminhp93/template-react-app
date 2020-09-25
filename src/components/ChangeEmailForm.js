import React from 'react';
import toastr from 'toastr';
import { Logger } from '@aws-amplify/core'
import { isEmail } from 'utils/validator';
import Auth from '@aws-amplify/auth';
import LoadingIndicator from 'components/LoadingIndicator';
import UserInfo from 'utils/userInfo';
import AuthenticationService from 'services/Authentication';


const logger = new Logger(__filename)


class ChangeEmailForm extends React.Component {
  state = {
    data: { newEmail: '', password: '', code: '' },
    requestedEmail: UserInfo.getRequestedEmail(),
    loading: false,
  };

  componentDidMount() {
    this.unsubribeUserInfo = UserInfo.onChange(this.handleUserProfileChange);
  }

  componentWillUnmount() {
    this.unsubribeUserInfo();
  }

  handleUserProfileChange = () => {
    this.setState({ requestedEmail: UserInfo.getRequestedEmail() });
  };

  handleChange = (e) => {
    const data = { ...this.state.data };
    data[e.target.name] = e.target.value;
    this.setState({ data });
  };

  handleCancel = () => {
    this.setState({ requestedEmail: null });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { requestedEmail, data } = this.state;
    if (requestedEmail) {
      if (!data.code || data.code === '') {
        toastr.error('Please enter your verification code');
        return;
      }
      this.setState({ loading: true });
      AuthenticationService.changeEmail({
        code: data.code,
        id_token: Auth.user.getSignInUserSession().getIdToken().getJwtToken(),
        access_token: Auth.user.getSignInUserSession().getAccessToken().getJwtToken(),
      }).then(() => {
        // Handle success response
        toastr.success('Changed email successfully. Please log in again.');
        this.setState({ loading: false });
        Auth.signOut();
      }).catch((error) => {
        // Handle error response
        logger.error(error);
        const errorCode = error.response && error.response.data && error.response.data.error_code;
        if (errorCode === 'code-expired') this.setState({ requestedEmail: null });
        this.setState({ loading: false });
      });
      return;
    }
    this.setState({ loading: true });
    Auth.signIn(UserInfo.getLinkedInEmail(), data.password)
      .then(() => {
        // Workaround for checking if an email is existed on Cognito
        // https://github.com/aws-amplify/amplify-js/issues/1067#issuecomment-436492775
        const code = '000000';
        Auth.confirmSignUp(data.newEmail, code, {
          // If set to False, the API will throw an AliasExistsException error
          // if the phone number/email used already exists as an alias with a different user
          forceAliasCreation: false,
        }).then(() => {
          this.setState({ loading: false });
          toastr.error('Email already existed');
        }).catch((err) => {
          let emailExisted = true;
          if (err.code === 'UserNotFoundException') emailExisted = false;
          if (emailExisted) {
            toastr.error('Email already existed');
            this.setState({ loading: false });
          } else {
            AuthenticationService.requestChangeEmail({ email: data.newEmail }).then(() => {
              this.setState({ loading: false });
              window.location.reload();
            }).catch((error) => {
              logger.error(error);
              this.setState({ loading: false });
            });
          }
        });
      })
      .catch(() => {
        toastr.error('Invalid password');
        this.setState({ loading: false });
      });
  };

  render() {
    const {
      data, loading, requestedEmail,
    } = this.state;
    const requesting = !!requestedEmail;
    const isValid = requesting ? data.code !== '' : (data.newEmail !== '' && data.password !== '' && isEmail(data.newEmail));
    return (
      <form onSubmit={this.handleSubmit} method="POST">
        {requesting
          ? (
            <div className="text-left mb-4">
              <div>
                You recently requested to change your email to
                <b>{requestedEmail}</b>
                .
              </div>
              <div className="mb-3">To confirm, please enter the code you received via your new email.</div>
              <input
                type="text"
                name="code"
                id="codeInput"
                value={data.code}
                placeholder="Enter code"
                className="form-control"
                onChange={this.handleChange}
              />
            </div>
          )
          : (
            <>
              <div className="text-left mb-4">
                <label htmlFor="password" className="font-weight-bold">Current Password</label>
                <input
                  type="password"
                  name="password"
                  id="passwordInput"
                  value={data.password}
                  placeholder="Enter password"
                  className="form-control"
                  onChange={this.handleChange}
                />
                <div>Please enter your current password to confirm</div>
              </div>
              <div className="text-left mb-4">
                <label htmlFor="passwordConfirmation" className="font-weight-bold">Email</label>
                <input
                  type="text"
                  name="newEmail"
                  id="emailInput"
                  placeholder="abc@example.com"
                  value={data.newEmail}
                  className="form-control"
                  onChange={this.handleChange}
                />
              </div>
            </>
          )}
        {!loading && requesting
          && (
          <button
            id="cancelButton"
            className="btn btn-link btn-lg px-4 mt-2 text-uppercase"
            type="button"
            onClick={this.handleCancel}
          >
            Back
          </button>
          )}
        {loading ? <LoadingIndicator /> : (
          <button
            id="changeEmailButton"
            className="btn btn-primary btn-lg px-4 mt-2 text-uppercase"
            type="submit"
            disabled={!isValid}
          >
            {requesting ? 'Confirm' : 'Update'}
          </button>
        )}
      </form>
    );
  }
}

export default ChangeEmailForm;
