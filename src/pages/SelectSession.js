import React from 'react';
import userInfo from 'utils/userInfo';
import { SupportFooter } from 'components/SupportFooter';
import ConfirmSession from 'components/ConfirmSession';
import SessionForm from 'components/SessionForm';
import OnBoardingService from 'services/OnBoarding';
import makePageTitle from 'utils/common';
import history from 'utils/history';


class SelectSession extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      session: null,
      loading: false,
      submitError: null,
      mode: 'select',
    };
  }

  componentDidMount() {
    document.title = makePageTitle('Select Session');
    const session = userInfo.getCurrentSession();
    if (session) {
      history.push('/profile-setup');
    }
  }

  makeSessionTitle = (session) => session.program && session.location
    && `${session.name} . ${session.program.name} . ${session.location.address}`;

  handleSelectSession = (session) => {
    this.setState({ session }, () => {
      this.setState({ mode: 'confirm' });
    });
  };

  handleSelectInviteSession = (session) => {
    this.setState({ session })
  };

  handleConfirmSession = () => {
    this.setState({ loading: true });
    OnBoardingService.selectSession({
      session_id: this.state.session.id,
      user_id: userInfo.getUserId(),
    }).then((res) => {
      if (res && res.data) {
        this.setState({ mode: 'confirm', loading: false });
        userInfo.setUserInfo(res.data);
        history.push('/profile-setup');
      } else {
        this.setState({ loading: false });
      }
    }).catch((err) => {
      if (err.response && err.response.data) {
        this.setState({
          submitError: err.response.data.error_message,
          loading: false,
        });
      }
    });
  };

  renderSessionForm = () => (
    <>
      <SessionForm
        session={this.state.session}
        code={this.state.code}
        submitError={this.state.submitError}
        loading={this.state.loading}
        selectSession={this.handleSelectSession}
        selectInviteSession={this.handleSelectInviteSession}
      />
      <SupportFooter />
    </>
  );

  renderConfirmSession = () => (
    <>
      <ConfirmSession
        sessionTitle={this.state.session && this.state.session.title}
        selectSession={() => this.setState({ mode: 'select' })}
        confirmSession={this.handleConfirmSession}
        loading={this.state.loading}
      />
      <SupportFooter />
    </>
  );

  render() {
    const isSelect = this.state.mode === 'select';
    return isSelect ? this.renderSessionForm() : this.renderConfirmSession();
  }
}

export default SelectSession;
