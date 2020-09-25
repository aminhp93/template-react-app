import * as React from 'react';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import Select from 'react-select';
import FilterService from 'services/Filter';
import ProfileService from 'services/Profile';
import LoadingIndicator from 'components/LoadingIndicator';
import { SupportFooter } from 'components/SupportFooter';

const logger = new Logger('components/SessionForm');

class SessionForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      search: '',
      sessions: [],
      session: props.session,
      searchingSessions: false,
    };
    this.fetchSessions = debounce(this.fetchSessions, 300);
  }

  componentDidMount() {
    this.fetchSessions();
    this.fetchInviteSessionInfo();
  }

  makeSessionTitle = (session) => session.program && session.location
    && `${session.name} . ${session.program.name} . ${session.location.address}`;

  fetchSessions() {
    const params = {};
    if (this.state.search) {
      params.q = this.state.search;
    }
    this.setState({ searchingSessions: true });
    FilterService.getFilterValues('sessions', params).then((res) => {
      if (res && res.data && res.data.length > 0) {
        // Add the session to the session list as react-select only shows available options
        res.data.push(this.state.session);
        this.setState({
          sessions: res.data
            .filter((session) => session && Object.keys(session).length)
            .map((session) => ({
              id: session.id,
              title: this.makeSessionTitle(session),
            })),
          searchingSessions: false
        });
      } else {
        this.setState({ searchingSessions: false });
      }
    }).catch((e) => {
      this.setState({ searchingSessions: false });
      logger.error(e);
    });
  }

  fetchInviteSessionInfo() {
    ProfileService.getInviteInfo().then((res) => {
      this.setState({session: { ...res.data.session, title: this.makeSessionTitle(res.data.session) }});
      this.props.selectInviteSession({ ...res.data.session, title: this.makeSessionTitle(res.data.session) });
    }).catch((e) => {
      logger.error(e);
    });
  }

  handleSelectInputChange = (search) => {
    if (!search) return;
    this.setState({ search, session: null }, () => this.fetchSessions());
  };

  handleSelect = (session) => {
    this.setState({ session }, () => {
      if (this.state.error && Object.keys(this.state.error).length > 0) this.validateInput();
    });
  };

  handleButtonClick = () => {
    this.props.selectSession(this.state.session);
  };

  validateInput = () => {
    const error = {};
    if (!this.state.session) {
      error.session = 'Please select a session';
    }
    this.setState({ error });
    return Object.keys(error).length <= 0;
  };

  render() {
    const {
      session, sessions, error, searchingSessions
    } = this.state;
    return (
      <div className="sign-up text-center">
        <div className="sign-up--main-text">Your Insight session</div>
        <div className="sign-up--card welcome-page">
          {this.props.submitError
            ? <p className="mb-4 text-danger">{this.props.submitError}</p>
            : (
              <p className="mb-4">
                You can edit your session by choosing one from the drop-down menu. If your program starts on September, please choose 2020C.
              </p>
            )}
          <div id="userSessionSelect" className="text-left mb-2">
            <label htmlFor="session">Session</label>
            <i className="fa fa-search fa-lg" />
            <Select
              name="session"
              placeholder="Enter your session"
              value={session && session.id}
              onChange={this.handleSelect}
              onInputChange={this.handleSelectInputChange}
              filterOption={() => true}
              valueKey="id"
              labelKey="title"
              options={sessions}
              clearable={false}
              onBlurResetsInput={false}
              isLoading={searchingSessions}
            />
            <span className="text-danger">{error && error.session}</span>
          </div>
          {this.props.loading ? <LoadingIndicator />
            : (
              <button
                id="checkSessionButton"
                className="btn btn-primary btn-lg px-4 mt-2"
                type="submit"
                onClick={this.handleButtonClick}
                disabled={this.props.session === null && this.state.session === null}
              >
                NEXT
              </button>
            )}
        </div>

        <SupportFooter />
      </div>
    );
  }
}

SessionForm.propTypes = {
  session: PropTypes.objectOf(PropTypes.any),
  selectSession: PropTypes.func,
  selectInviteSession: PropTypes.func,
  loading: PropTypes.bool,
  submitError: PropTypes.string,
};

export default SessionForm;
