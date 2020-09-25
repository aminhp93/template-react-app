import * as React from 'react';
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux';
import { default as Auth, CognitoUser } from '@aws-amplify/auth';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import * as Sentry from '@sentry/browser';

import LoadingIndicator from 'components/LoadingIndicator';
import { TUserProfileData } from 'types';
import LoginForm from 'components/LoginForm';
import ChangePasswordForm from 'components/ChangePasswordForm';
import ProfileService from 'services/Profile';
import { OnBoardingStep } from 'constants/common';
import userInfo from 'utils/userInfo';
import { fetchProfile } from 'reducers/authUser';
import { SupportFooter } from 'components/SupportFooter';
import PageTitle from 'components/PageTitle';
import emitter, { EVENT_KEYS } from 'utils/event';

const logger = new Logger('pages/Login');


export type TProps = {
  fetchProfile: () => Promise<{ data: TUserProfileData }>
}

class Login extends React.Component<TProps> {
  state = {
    loading: false,
    loading2: false,
    user: {} as CognitoUser,
    error: null,
  }

  handleLogin = (event) => {
    event.preventDefault();
    this.setState({ error: null, loading: true });

    const { username, password } = event.target;
    const email = username.value.trim().toLowerCase();

    Auth.signIn(email, password.value)
      .then(this.handleLoginSuccess)
      .catch(this.handleError);
  };

  handleChangePassword = (event) => {
    event.preventDefault();
    this.setState({ error: null, loading: true });

    const { password } = event.target;

    const { user } = this.state;
    const params = (user['challengeParam'] && user['challengeParam']['requiredAttributes']) || [];
    const attributes = {};
    params.forEach((param) => {
      attributes[param] = event.target[param].value;
    });

    Auth.completeNewPassword(user, password.value, attributes)
      .then(this.handleChangePasswordSuccess)
      .catch(this.handleError);
  };

  handleLoginSuccess = async (user: CognitoUser) => {
    emitter.emit(EVENT_KEYS.LOG_IN);

    try {
      const user = await Auth.currentAuthenticatedUser();
      const attributes = await Auth.userAttributes(user);
      Sentry.withScope((scope) => {
        scope.setUser({
          id: `${attributes.find(a => a.getName() === 'sub')?.getValue()}`,
          email: `${attributes.find(a => a.getName() === 'email')?.getValue()}`
        });
        scope.setLevel(Sentry.Severity.Info);
        Sentry.captureMessage('User logged in')
      });
    } catch (e) {
      // Intentionally ignore
    }

    this.setState({ user, loading: false });
    try {
      const res = await this.props.fetchProfile()
      userInfo.setUserInfo(res.data);
      if (!user['challengeName']
          && userInfo.getOnBoardingStep() !== OnBoardingStep.COMPLETE) {
        window.location.href = '/';
      }
    } catch (err) {
      logger.error(err)
    }
  };

  handleChangePasswordSuccess = (user) => {
    logger.debug(user);
    this.setState({ user, loading2: true });
    ProfileService.setOnboarding({ onboarding_step: OnBoardingStep.SET_NEW_PASSWORD })
      .then((res) => {
        userInfo.setUserInfo(res.data);
        if (!user.challengeName && userInfo.getOnBoardingStep() !== OnBoardingStep.COMPLETE) {
          window.location.href = '/select-session';
        }
      })
      .catch((err) => {
        logger.error(err);
      });
  };

  handleError = (error) => {
    logger.error(error);

    // FIXME: the better way to do this is to check the error message against
    // a list of whitelisted messages, and default to the human friendly message below.
    if (error.message.toLowerCase().indexOf("too many request") >= 0) {
      error = `There was a problem logging you into the platform
, please reload the page or try again in a few minutes.`
    }

    this.setState({ error, loading: false });
  };

  withLayout(title, content) {
    const { error } = this.state;
    return (
      <div className="sign-up text-center">
        <PageTitle title={title} />
        <div className="sign-up--main-text">{title}</div>
        <div className="sign-up--card welcome-page">
          {error && (
            <p className="alert alert-danger">{error.message}</p>
          )}
          {content}
        </div>

        <SupportFooter />
      </div>
    );
  }

  render() {
    const { loading, loading2, user } = this.state;

    if (user['challengeName'] === 'NEW_PASSWORD_REQUIRED') {
      return this.withLayout(
        'New password required', (
          <ChangePasswordForm loading={loading} action={this.handleChangePassword} buttonText="RESET" />
        ),
      );
    }

    if (loading2) {
      return (
        <LoadingIndicator />
      )
    }

    return this.withLayout(
      'Login', (
        <LoginForm loading={loading} action={this.handleLogin} />
      ),
    );
  }
}

const mapStateToProps = (state) => {
  return state;
};

const mapDispatchToProps = {
  fetchProfile,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login))
