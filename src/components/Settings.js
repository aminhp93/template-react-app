import * as React from 'react';
import toastr from 'toastr';
import Auth from '@aws-amplify/auth';
import clsx from 'clsx';
import ChangeEmailForm from 'components/ChangeEmailForm';
import ChangePasswordForm from 'components/ChangePasswordForm';

import { Logger } from '@aws-amplify/core'


const logger = new Logger(__filename)

const Tab = {
  CHANGE_EMAIL: 'Email',
  CHANGE_PASSWORD: 'Password',
};

class Settings extends React.Component {
  state = {
    currentTab: Tab.CHANGE_EMAIL,
    loading: false,
  };

  handleChangePassword = (e) => {
    e.preventDefault();
    if (e.target.currentPassword && e.target.password) {
      const currentPassword = e.target.currentPassword.value;
      const password = e.target.password.value;
      if (password === currentPassword) {
        toastr.error('New password is the same as current password.');
        return;
      }
      Auth.currentAuthenticatedUser()
        .then((authenticatedUser) => {
          this.setState({ loading: true });
          Auth.changePassword(authenticatedUser, currentPassword, password).then((res) => {
            if (res === 'SUCCESS') {
              Auth.signOut();
              window.location.reload();
            }
            this.setState({ loading: false });
          }).catch((err) => {
            if (err.code === 'NotAuthorizedException') {
              // We have to do this because the error message from Cognito doesn't make sense
              toastr.error('Incorrect password');
            } else {
              toastr.error(err.message);
            }
            this.setState({ loading: false });
          });
        })
        .catch(err => logger.error(err));
    }
  };

  renderCurrentTab() {
    const { currentTab, loading } = this.state;
    if (currentTab === Tab.CHANGE_EMAIL) {
      return <ChangeEmailForm />;
    }
    if (currentTab === Tab.CHANGE_PASSWORD) {
      return (
        <ChangePasswordForm
          action={this.handleChangePassword}
          loading={loading}
          requiredOldPassword
          buttonText="UPDATE"
        />
      );
    }
    return null;
  }

  render() {
    const { currentTab } = this.state;
    return (
      <div className="row py-5">
        <div className="col-md-4 mb-2">
          <div className="sidebar-button menu mt-3">
            <i className="fa fa-cog fa-lg mr-2" />
            <b className="ml-1">Settings</b>
          </div>
          {Object.keys(Tab).map((key) => (
            <div
              key={key}
              className={clsx(
                'sidebar-filter-item pointer pl-5 py-25',
                { active: currentTab === Tab[key] },
              )}
              onClick={() => this.setState({ currentTab: Tab[key] })}
            >
              {Tab[key]}
            </div>
          ))}
        </div>
        <div className="col-md-8 mt-3">
          <div className="card">
            <div className="card-body text-center">
              {this.renderCurrentTab()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Settings;
