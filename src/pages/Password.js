import React from 'react';
import history from 'utils/history';
import PasswordForm from 'components/PasswordForm';
import ProfileService from 'services/Profile';
import emitter, { EVENT_KEYS } from 'utils/event';
import UserInfo from 'utils/userInfo';

import { Logger } from '@aws-amplify/core'

const logger = new Logger(__filename)

class Password extends React.Component {
  state = {
    submitting: false,
  };

  handleSubmit = (password) => {
    this.setState({ submitting: true });
    ProfileService.updateInfo({ password }).then(() => {
      this.setState({ submitting: false });
      ProfileService.getInfo().then((res) => {
        UserInfo.setUserInfo(res.data);
        emitter.emit(EVENT_KEYS.UPDATE_PASSWORD);
        history.push('/welcome');
      });
    }).catch((e) => {
      this.setState({ submitting: false });
      logger.error(e);
    });
  };

  render() {
    return (
      <div className="sign-up text-center">
        <div className="sign-up--main-text">Create your password for Insight account</div>
        <div className="sign-up--card">
          <PasswordForm onSubmit={this.handleSubmit} submitting={this.state.submitting} />
        </div>
      </div>
    );
  }
}

export default Password;
