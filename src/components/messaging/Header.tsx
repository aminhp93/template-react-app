import * as Sentry from '@sentry/react';
import React from 'react';
import Auth from '@aws-amplify/auth';
import { connect } from 'react-redux';
import { Link, NavLink, withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { get } from 'lodash';
import { Badge } from 'antd';

import LOGO_WHITE_URL from '@img/logo-white.png';

import { faviconKeySuccess } from 'reducers/faviconKey';
import {
  OnBoardingStep,
  DEFAULT_PROFILE_IMAGE_URL,
  CHAT_PATH,
  ModalKey,
  DocumentPathnames,
} from 'constants/common';
import PushNotificationService from 'services/PushNotification';
import {
  canSeeNewsFeed,
  getProfileImage,
} from './userInfo';
import userInfo from 'utils/userInfo';
import history from 'utils/history';
import { formatCount } from './utils';
import emitter, { EVENT_KEYS } from 'utils/event';
import { showModal } from 'actions/modal';

interface IProps {
  notificationList: any,
  history: any,
  authUser: any,
  userNotifications: any,
  showModal: any,
  faviconKey: any,
  faviconKeySuccess: any,
  location: any,
}

class Header extends React.Component<IProps> {
  dropDownToggleRef: any;
  dropDownToggleSmallRef: any;
  fellowDropdownToggleRef: any;
  title: any;
  removeUserInfoListener: any;
  removeHistoryListener: any;

  state = {
    dropdownOpen: false,
    fellowDropdownOpen: false,
    dropdownMobileOpen: false,
  };

  componentDidMount() {
    window.document.addEventListener('click', (e) => this.hideDropDown(e));
    this.title = document.title;
    window.addEventListener('focus', this.onFocus);
    window.addEventListener('blur', this.onBlur);
    this.checkPendingAgreements();
    this.removeUserInfoListener = userInfo.onChange(() => {
      this.checkPendingAgreements();
    });
    this.removeHistoryListener = history.listen(() => {
      this.checkPendingAgreements();
    });
  }

  componentDidUpdate() {
    const { userNotifications, faviconKey, faviconKeySuccess } = this.props;
    if (userNotifications.isRead === true && faviconKey !== 'default') {
      faviconKeySuccess('default')
    }

    if ( userNotifications.isRead === false && faviconKey  !== 'notification') {
      faviconKeySuccess('notification')
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { userNotifications: nextUserNotifications, location: nextLocation } = nextProps;
    const { userNotifications, location } = this.props;
    return !(JSON.stringify(userNotifications) === JSON.stringify(nextUserNotifications)
        && JSON.stringify(location) === JSON.stringify(nextLocation)
        && JSON.stringify(nextState) === JSON.stringify(this.state));
  }

  componentWillReceiveProps(nextProps) {
    const { userNotifications: nextUserNotifications } = nextProps;
    const { userNotifications } = this.props;
    if (userNotifications.mentionCount !== nextUserNotifications.mentionCount && !document.hasFocus()) {
      document.title = `${nextUserNotifications.mentionCount > 0 ? `(${nextUserNotifications.mentionCount}) ` : ''}${this.title}`;
    }
  }

  componentWillUnmount() {
    window.document.removeEventListener('click', (e) => this.hideDropDown(e));
    window.removeEventListener('focus', this.onFocus);
    window.removeEventListener('blur', this.onBlur);
    this.removeUserInfoListener();
    this.removeHistoryListener();
  }

  checkPendingAgreements() {
    const onBoardingCompleted = userInfo.getOnBoardingStep() === OnBoardingStep.COMPLETE;
    const pendingAgreements = (userInfo.data && userInfo.data.pending_agreements) || [];
    const isDocumentPage = Object.values(DocumentPathnames).includes(history.location.pathname);
    if (!isDocumentPage && onBoardingCompleted && pendingAgreements.length > 0) {
      const { showModal } = this.props;
      showModal(ModalKey.AGREEMENT_FORM, {
        modalData: {
          agreementId: pendingAgreements[0],
        },
      });
    }
  }

  onFocus = () => {
    document.title = this.title;
  };

  onBlur = () => {
    const { userNotifications } = this.props;
    document.title = `${userNotifications.mentionCount > 0 ? `(${userNotifications.mentionCount}) ` : ''}${this.title}`;
  };

  toggleDropDown() { this.setState({ dropdownOpen: !this.state.dropdownOpen }); }

  toggleFellowDropDown() { this.setState({ fellowDropdownOpen: !this.state.fellowDropdownOpen }); }

  toggleDropDownMobile() { this.setState({ dropdownMobileOpen: !this.state.dropdownMobileOpen }); }

  hideDropDown(e) {
    if (this.dropDownToggleRef && this.dropDownToggleSmallRef
        && !this.dropDownToggleRef.contains(e.target)
        && !this.dropDownToggleSmallRef.contains(e.target)) {
      this.setState({ dropdownOpen: false });
    }
    if (this.fellowDropdownToggleRef && !this.fellowDropdownToggleRef.contains(e.target)) {
      this.setState({ fellowDropdownOpen: false });
    }
  }

  logout = async () => {
    emitter.emit(EVENT_KEYS.LOG_OUT);
    try {
      await PushNotificationService.deactivateToken();
    } finally {
      await Auth.signOut();
      window.location.reload();
    }
  };

  viewFullChatPage = () => {
    emitter.emit(EVENT_KEYS.VIEW_FULL_CHAT_PAGE);
  };

  renderNavBadge = () => {
    const { userNotifications } = this.props;
    if (userNotifications.isRead === false || userNotifications.mentionCount > 0){
      if(userNotifications.mentionCount > 0){
        return (
          <Badge count={formatCount(userNotifications.mentionCount)} className="channel-badge navbar-notification" />
        )
      }
      return (
        <Badge className="channel-badge navbar-notification" dot />
      )
    }
  };

  render() {
    // console.log('Header')
    const { authUser } = this.props;
    const { onboarding_step } = authUser;
    const onBoardingCompleted = onboarding_step === OnBoardingStep.COMPLETE;

    return (
      <nav className={`navbar navbar-expand-lg navbar-light global-header ${process.env.ENV === 'staging' ? 'staging' : ''}`}>
        <div className="container">
          <Link to="/" className="navbar-brand">
            <img
              src={LOGO_WHITE_URL}
              className="img-responsive"
              alt="Insight Data Science"
              height="35px"
            />
          </Link>
          {authUser && JSON.stringify(authUser) !== '{}' && (
            <>
              <button
                ref={(ref) => this.dropDownToggleSmallRef = ref}
                className="navbar-toggler"
                onClick={() => this.toggleDropDownMobile()}
              >
                <span className="navbar-toggler-icon" />
              </button>
              <div className="collapse navbar-collapse">
                {onBoardingCompleted && (
                  <ul className="navbar-nav navbar-left">
                    {canSeeNewsFeed(authUser) && <NavLink to="/feed" activeClassName="active">HOME</NavLink>}
                    <NavLink to="/people" activeClassName="active">PEOPLE</NavLink>
                    <NavLink to="/events" activeClassName="active">EVENTS</NavLink>
                    <>
                      <NavLink to={CHAT_PATH} activeClassName="active">MESSAGING</NavLink>
                      { this.renderNavBadge() }
                    </>
                    <NavLink to="/alumni-recommendations" activeClassName="active">RECOMMENDATIONS</NavLink>
                  </ul>
                )}
                <ul className="navbar-nav ml-auto">
                  {onBoardingCompleted && (
                    <li className="nav-item dropdown moreButtonContainer">
                      <a
                        ref={ref => this.fellowDropdownToggleRef = ref}
                        className="nav-link dropdown-toggle"
                        onClick={() => this.toggleFellowDropDown()}
                      >
                        MORE
                      </a>
                      <div className={`dropdown-menu ${this.state.fellowDropdownOpen ? 'show' : ''}`}>
                        {userInfo.isToggleFeature('interviews') &&
                         <NavLink to="/interviews" className="dropdown-item" activeClassName="active">Interviews</NavLink>
                        }
                        {userInfo.isStaff() &&
                         <NavLink to="/interviews-demo" className="dropdown-item" activeClassName="active">Interviews (Demo)</NavLink>
                        }
                        <NavLink to="/resources" className="dropdown-item" activeClassName="active">Resources</NavLink>
                        <NavLink to="/projects" className="dropdown-item" activeClassName="active">Projects</NavLink>
                      </div>
                    </li>
                  )}
                  <li className="nav-item dropdown">
                    <a
                      id="headerDropdownButton"
                      ref={(ref) => this.dropDownToggleRef = ref}
                      className="nav-link dropdown-toggle"
                      onClick={() => this.toggleDropDown()}
                    >
                      <img
                        className="profile--image"
                        src={getProfileImage(authUser) || DEFAULT_PROFILE_IMAGE_URL}
                        width="35px"
                        alt="Profile"
                      />
                    </a>
                    <div className={`dropdown-menu ${this.state.dropdownOpen ? 'show' : ''}`}>
                      <NavLink to="/profile" className="dropdown-item" activeClassName="active">Profile</NavLink>
                      <NavLink to="/settings" className="dropdown-item" activeClassName="active">Account Settings</NavLink>
                      <a className="dropdown-item logout" onClick={this.logout} id="logoutButton">Log out</a>
                    </div>
                  </li>
                </ul>
              </div>
              <div className={`dropdown-menu dropdown-mobile ${this.state.dropdownMobileOpen ? 'show' : ''}`}>
                {canSeeNewsFeed(authUser) && <NavLink to="/feed" className="dropdown-item" activeClassName="active">Home</NavLink>}
                <NavLink to="/people" className="dropdown-item" activeClassName="active">People</NavLink>
                <NavLink to="/events" className="dropdown-item" activeClassName="active">Events</NavLink>
                <NavLink to="/alumni-recommendations" className="dropdown-item" activeClassName="active">Recommendations</NavLink>
                {userInfo.isToggleFeature('interviews') &&
                 <NavLink to="/interviews" className="dropdown-item" activeClassName="active">Interviews</NavLink>
                }
                {userInfo.isStaff() &&
                 <NavLink to="/interviews-demo" className="dropdown-item" activeClassName="active">Interviews (Demo)</NavLink>
                }
                <NavLink to="/projects" className="dropdown-item" activeClassName="active">Projects</NavLink>
                <NavLink to="/resources" className="dropdown-item" activeClassName="active">Resources</NavLink>
                <NavLink exact to="/profile" className="dropdown-item" activeClassName="active">Profile</NavLink>
                <NavLink to="/settings" className="dropdown-item" activeClassName="active">Account settings</NavLink>
                <a className="dropdown-item logout" onClick={this.logout}>Log out</a>
              </div>
            </>
          )}
        </div>
      </nav>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    userNotifications: get(state, 'userNotifications') || {},
    authUser: get(state, 'authUser') || {},
    faviconKey: get(state, 'faviconKey') || 'default',
  };
};

const mapDispatchToProps = {
  showModal,
  faviconKeySuccess,
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(Sentry.withProfiler(Header, { name: "Header"}));
