import React from 'react';
import history from 'utils/history';
import userInfo from 'utils/userInfo';

class Reminder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: userInfo.getUserInfo(),
      isOnboarding: history.location.pathname === '/welcome' || history.location.pathname === '/password',
    };
  }

  componentDidMount() {
    this.removeUserInfoListener = userInfo.onChange(() => this.setState({ userInfo: userInfo.getUserInfo() }));
    this.removeHistoryListener = history.listen(() => {
      this.setState({
        isOnboarding: history.location.pathname === '/welcome' || history.location.pathname === '/password',
      });
    });
  }

  componentWillUnmount() {
    this.removeUserInfoListener();
    this.removeHistoryListener();
  }

  render() {
    const { isOnboarding } = this.state;
    const hasGroupInfo = this.state.userInfo.groups && this.state.userInfo.groups.length > 0;
    return (isOnboarding || hasGroupInfo) ? null : (
      <div
        className="container-fluid profile--notification pointer"
        onClick={() => history.push('/profile')}
      >
        Welcome
        {' '}
        {userInfo.getUserName()}
        ! Your profile is almost completed.
        Click here to update your session info to gain full access to our platform.
      </div>
    );
  }
}

export default Reminder;
