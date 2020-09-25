import * as React from 'react';
import * as Sentry from '@sentry/browser';
import Auth from '@aws-amplify/auth';
import { Hub, Logger } from '@aws-amplify/core';
import { connect } from 'react-redux';

import { TUserProfileData } from 'types';
import { default as LegacyUserInfo, UserInfo } from 'utils/userInfo';
import LoadingIndicator from 'components/LoadingIndicator';
import { fetchProfile } from 'reducers/authUser';

const logger = new Logger(__filename);

export const UserContext = React.createContext(null);

export type TProps = {
  fetchProfile: () => Promise<{ data: TUserProfileData }>;
};

class UserContextProvider extends React.Component<TProps> {
  state = {
    user: null,
    loading: true,
  };

  async componentDidMount() {
    Hub.listen('auth', this.onAuthEvent);

    try {
      await this.loadUserProfile();
    } catch (e) {
      logger.warn('User not logged in');
    }

    this.setState({ loading: false });
  }

  componentWillUnmount() {
    Hub.remove('auth', this.onAuthEvent);
  }

  onAuthEvent = async ({ payload }) => {
    if (payload.event === 'signIn') {
      this.loadUserProfile();
    }
  };

  async loadUserProfile() {
    const user = await Auth.currentAuthenticatedUser();
    const attributes = await Auth.userAttributes(user);
    Sentry.configureScope((scope) => {
      scope.setUser({
        id: `${attributes.find((a) => a.getName() === 'sub')?.getValue()}`,
        email: `${attributes.find((a) => a.getName() === 'email')?.getValue()}`,
      });
    });

    const response = await this.props.fetchProfile();

    // FIXME: did not have the time to handle this yet, so we need to
    // make this call to be compatible with components still using utils/userInfo
    LegacyUserInfo.setUserInfo(response.data);

    this.setState({
      user: new UserInfo(response.data),
    });
  }

  render() {
    const { user, loading } = this.state;

    if (loading) return <LoadingIndicator />;

    return (
      <UserContext.Provider value={user}>
        {this.props.children}
      </UserContext.Provider>
    );
  }
}

const mapDispatchToProps = {
  fetchProfile,
};

export default connect(null, mapDispatchToProps)(UserContextProvider);
