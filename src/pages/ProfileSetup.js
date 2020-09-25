import * as React from 'react';
import makePageTitle from 'utils/common';

import Auth from '@aws-amplify/auth';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import ProfileSetupForm from 'components/Onboarding/ProfileSetupForm';
import userInfo from 'utils/userInfo';
import history from 'utils/history';
import { OnBoardingStep } from 'constants/common';
import OnBoardingService from '../services/OnBoarding';
import { SupportFooter } from 'components/SupportFooter';

const logger = new Logger('pages/ProfileSetup');


class ProfileSetup extends React.Component {
  state = {
    error: null,
    user: null,
    loading: false,
  };

  async componentDidMount() {
    document.title = makePageTitle('Profile setup');
    if (userInfo.isInsightUser()
      && userInfo.getOnBoardingStep() === OnBoardingStep.SET_NEW_PASSWORD) {
      history.push('/select-session');
    } else {
      Auth.currentAuthenticatedUser()
        .then((user) => {
          this.setState({ user }, () => { logger.debug(this.state.user); });
        });
    }
  }

  handleProfileSetup = (e) => {
    e.preventDefault();
    this.setState({ error: null, loading: true });
    const { family_name, given_name, linkedin } = e.target;
    const attributes = {
      family_name: family_name.value,
      given_name: given_name.value,
      'custom:linkedin': linkedin.value,
    };
    Auth.updateUserAttributes(this.state.user, attributes)
      .then(() => this.handleSuccess())
      .catch((error) => { this.setState({ error }); });
  };

  handleSuccess = () => {
    this.setState({ error: null, loading: true });
    Auth.currentUserInfo()
      .then((data) => {
        if (data && data.attributes) {
          const userData = {
            last_name: data.attributes.family_name,
            first_name: data.attributes.given_name,
            cognito_username: data.attributes.sub,
            linkedin: data.attributes['custom:linkedin'],
            onboarding_step: OnBoardingStep.UPDATE_PROFILE,
          };
          OnBoardingService.updateProfile(userData)
            .then((res) => {
              logger.debug('res data from Onboarding', res.data);
              userInfo.setUserInfo(res.data);
              logger.debug('get user info', userInfo.getUserInfo());
              this.setState({ loading: true });
              // Dirty trick to redirect to home page after completing on-boarding
              window.location.pathname = '/';
            })
            .catch((err) => {
              logger.error(err, userData);
              const { response } = err;
              if (response && response.data && response.data.linkedin) {
                this.setState({
                  error: { message: 'Please enter a valid LinkedIn URL in the format of http://www.linkedin.com/in/johndoe' },
                  loading: false,
                });
              }
            });
        }
      });
  };

  render() {
    const { error, loading } = this.state;
    return (
      <div className="sign-up text-center">
        <div className="sign-up--main-text">Tell us about yourself</div>
        <div className="sign-up--card welcome-page">
          {error
            ? <p className="alert alert-danger">{error.message}</p>
            : (
              <p className="mb-4">
                {`You can edit your personal information. Once you click "Confirm", your profile image and current position on LinkedIn will be automatically synced to your platform account in the next 24 hours.`}
              </p>
            )}
          <ProfileSetupForm loading={loading} action={this.handleProfileSetup} />
        </div>
        <SupportFooter />
      </div>
    );
  }
}

export default ProfileSetup;
