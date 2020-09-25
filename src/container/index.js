import * as React from 'react';
import { notification } from 'antd';
import Favicon from 'react-favicon';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import toastr from 'toastr';
import {
  Router, Route, Switch, Redirect,
} from 'react-router-dom';
import { get } from 'lodash';
import history from 'utils/history';
import PushNotificationService from 'services/PushNotification';

import { fetchTeamNotifications } from 'reducers/teamNotifications';
import { fetchReactions } from 'reducers/reactions';
import { fetchUserNotification } from 'reducers/userNotifications';
import { reconnect } from 'reducers/reconnect';

import ModalContainer from 'components/Modals/Container';
import EventForm from 'components/Events/EventForm';
import EventDirectory from 'components/Events/index';
import EventInfo from 'components/Events/EventInfo';
import EventPrint from 'components/Events/EventPrint';
import ServerErrorModal from 'components/Modals/ServerError';

import Login from 'pages/Login';
import Project from 'pages/Project';
import Profile from 'pages/Profile';
import Directory from 'pages/People';
import Resource from 'pages/Resource';
import Settings from 'pages/Settings';
import NewsFeed from 'pages/NewsFeed';
import EditProject from 'pages/EditProject';
import ProfileSetup from 'pages/ProfileSetup';
import AlumniProfile from 'pages/AlumniProfile';
import CreateProject from 'pages/CreateProject';
import ResetPassword from 'pages/ResetPassword';
import SelectSession from 'pages/SelectSession';
import ProjectDirectory from 'pages/ProjectDirectory';
import FeedDetail from 'pages/FeedDetail';
import AlumniRec from 'pages/AlumniRec';
import Interview from 'pages/Interview';
import { OnBoardingStep, CHAT_PATH, FAVICONS } from 'constants/common';
import Document from 'pages/Document';
import FAQ from 'pages/FAQ';
import Network, { NetworkStatus } from 'services/Network';
import PushNotificationPrompt from 'components/PushNotificationPrompt'

import { UserContext } from 'containers/authentication'

import Messaging from 'pages/Messaging'
import NewMessagingHeader from 'components/messaging/Header';
import MessagingService from 'services/Messaging';

import { DocumentPathnames } from '../constants/common';
import * as Sentry from "@sentry/browser";

// Make the notifier shown in the bottom left of the screen
toastr.options = { positionClass: 'toast-bottom-left' };

notification.config({
  placement: 'bottomLeft',
  duration: 5
});


class Container extends React.Component {
  static contextType = UserContext;

  state = {
    hasServerError: false,
    showOtherPrompt: false,
    closePrompt: true,
  };

  componentDidMount() {
    if (this.props.authUser.id) {
      MessagingService.init(`user-${this.props.authUser.id}`).then(() => {
        this.props.fetchUserNotification();
        this.props.fetchReactions();
      });
      PushNotificationService.activateToken().then((res) => {
        Sentry.captureMessage('Re-activate browser token SUCCEEDED');
      }).catch((error) => {
        Sentry.captureMessage(`Re-activate browser token FAILED || ${error}`);
      });
    }

    // Run network status indicator as background
    Network.runNetworkIndicator();
    Network.addListener(this.handleNetworkStatusChange);

    this.setState({
      closePrompt: !PushNotificationService.supported || PushNotificationService.dismissed,
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.authUser.id && this.props.authUser.id !== prevProps.authUser.id) {
      MessagingService.init(`user-${this.props.authUser.id}`).then(() => {
        this.props.fetchUserNotification();
        this.props.fetchReactions();
      });
      PushNotificationService.activateToken().then((res) => {
        Sentry.captureMessage(`Re-activate browser token SUCCEEDED || ${res}`);
      }).catch((error) => {
        Sentry.captureMessage(`Re-activate browser token FAILED || ${error}`);
      });
    }
  }

  componentWillUnmount() {
    Network.removeListener(this.handleNetworkStatusChange);
  }

  handleOpenNotificationRequest = () => {
    const user = this.context;
    PushNotificationService.initialize(user.getUserId())
      .then(this.closePrompt);
  };

  handleNetworkStatusChange = (status) => {
    if (status === NetworkStatus.ONLINE) {
      this.props.reconnectAction();
    }
  };

  closePrompt = () => {
    this.setState({ closePrompt: true });
  };

  showAnotherPrompt = () => {
    this.setState({ showOtherPrompt: true });
  };

  storeToLocalStorage = () => {
    localStorage.setItem('pushNotification', 'never');
    this.closePrompt();
  };

  renderRoutes() {
    const user = this.context;
    const isLoggedIn = user !== null;

    const isCompletedOnBoarding = user && user.getOnBoardingStep() === OnBoardingStep.COMPLETE;
    if (isLoggedIn && !isCompletedOnBoarding) {
      return (
        <Switch>
          <Route path="/profile" name="Profile" component={Profile} />
          {user.isInsightUser() && <Route path="/select-session" name="Select Session" component={SelectSession} />}
          <Route path="/profile-setup" name="Profile Setup" component={ProfileSetup} />
          <Redirect path="/" to={(user.isInsightUser()) ? '/select-session' : '/profile-setup'} />
        </Switch>
      );
    }

    if (isLoggedIn && isCompletedOnBoarding) {
      return (
        <>
          <Switch>
            {user.canSeeNewsFeed() && <Route path="/feed/:id" name="postDetail" component={FeedDetail} />}
            {user.canSeeNewsFeed() && <Route path="/feed" name="Home" component={NewsFeed} />}
            <Route path="/profile/:id" name="Alumni Profile" component={AlumniProfile} />
            <Route path="/profile" name="Profile" component={Profile} />
            <Route path="/resources" name="Resource Directory" component={Resource} />
            <Route path="/people" name="People Directory" component={Directory} />
            <Route path="/projects/create" name="Project Create" component={CreateProject} />
            <Route path="/projects/:slug/edit" name="Project Edit" component={EditProject} />
            <Route path="/projects/:slug" name="Project" component={Project} />
            <Route path="/projects" name="Project Directory" component={ProjectDirectory} />
            <Route path="/events/create" name="Event Create" component={EventForm} />
            <Route path="/events/:slug/edit" name="Event Edit" component={EventForm} />
            <Route path="/events/:slug/print" name="Event Print" component={EventPrint} />
            <Route path="/events/:slug" name="Event Detail" component={EventInfo} />
            <Route path="/events" name="Event Directory" component={EventDirectory} />
            <Route path="/settings" name="Account Settings" component={Settings} />
            <Route path={DocumentPathnames.privacyPolicy} name="Privacy Policy" render={(props) => <Document {...props} documentKey="privacy_policy" />} />
            <Route path={DocumentPathnames.termOfService} name="Term of Service" render={(props) => <Document {...props} documentKey="term_of_service" />} />
            <Route path={DocumentPathnames.cookiePolicy} name="Cookie Policy" render={(props) => <Document {...props} documentKey="cookie_policy" />} />
            <Route path="/faq" name="FAQ" component={FAQ} />
            <Route path={`${CHAT_PATH}/:team?/:conversation?/:thread?/`} name="Chat" component={Messaging} />
            <Route path="/alumni-recommendations" name="AlumniRec" component={AlumniRec} />
            {user.isStaff() && <Route path="/interviews-demo" name="Demo Interviews for Staff" render={(props) => <Interview {...props} demo />} />}
            {user.isToggleFeature('interviews') && <Route path="/interviews" name="Interviews" component={Interview} />}
            <Redirect from="/" to={`${user.canSeeNewsFeed() ? '/feed' : '/people'}`} />
          </Switch>
        </>
      );
    }

    return (
      <Switch>
        <Route path="/login" name="Login" component={Login} />
        <Route path="/reset-password" name="Reset Password" component={ResetPassword} />
        <Route path={DocumentPathnames.privacyPolicy} name="Privacy Policy" render={(props) => <Document {...props} documentKey="privacy_policy" />} />
        <Route path={DocumentPathnames.termOfService} name="Term of Service" render={(props) => <Document {...props} documentKey="term_of_service" />} />
        <Route path={DocumentPathnames.cookiePolicy} name="Cookie Policy" render={(props) => <Document {...props} documentKey="cookie_policy" />} />
        <Route path="/faq" name="FAQ" component={FAQ} />
        <Redirect from="/" to="/login" />
      </Switch>
    );
  }

  render() {
    // console.log('index')
    const {
      closePrompt, showOtherPrompt, hasServerError,
    } = this.state;
    const user = this.context;
    const isLoggedIn = user !== null;

    const { faviconKey } = this.props;

    return (
      <Router history={history}>
        <>
          <Favicon url={FAVICONS[faviconKey].url} />
          {isLoggedIn && !closePrompt && (
            <PushNotificationPrompt
              showOtherPrompt={showOtherPrompt}
              showAnotherPrompt={this.showAnotherPrompt}
              handleOpenNotificationRequest={this.handleOpenNotificationRequest}
              storeToLocalStorage={this.storeToLocalStorage}
              closePrompt={this.closePrompt}
            />
          )}
          <NewMessagingHeader/>
          {this.renderRoutes()}
          <ModalContainer />
          {hasServerError && (
            <ServerErrorModal
              isOpen
              size="xlg"
              close={() => { this.setState({ hasServerError: false }); }}
            />
          )}
        </>
      </Router>
    );
  }
}

Container.defaultProps = {
  faviconKey: 'default'
};

Container.propTypes = {
  reconnectAction: PropTypes.func.isRequired,
  fetchTeamNotifications: PropTypes.func.isRequired,
  fetchReactions: PropTypes.func.isRequired,
  fetchUserNotification: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    faviconKey: get(state, 'faviconKey') || 'default',
    authUser: get(state, 'authUser') || {}
  };
};

const mapDispatchToProps = {
  reconnectAction: reconnect,
  fetchTeamNotifications,
  fetchReactions,
  fetchUserNotification
};

export default connect(mapStateToProps, mapDispatchToProps)(Container);
