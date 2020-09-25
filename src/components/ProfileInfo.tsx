import * as React from 'react';
import { Base64 } from 'js-base64';
import differenceInHours from 'date-fns/difference_in_hours';
import { connect } from 'react-redux';
import { get } from 'lodash';

import config from 'config';
import { DEFAULT_PROFILE_IMAGE_URL, CHAT_PATH } from 'constants/common';
import Tabs from 'components/Tabs';
import history from 'utils/history';
import QueryString from 'utils/queryString';
import ProfileService from 'services/Profile';
import emitter, { EVENT_KEYS } from 'utils/event';
import ProfileOverviewTab from './ProfileOverviewTab';
import { checkDMG } from 'reducers/conversations';
import { canManagePlatform, canSeeNewsFeed } from 'components/messaging/userInfo';


import STAR_URL from '@img/star.png';
import SEND_DM_MESSAGE_URL from '@img/send_dm_message.svg';
import { getCurrentPositions } from 'utils/userInfo';

interface IProps {
    authUser: any,
    selectedProfile: any,
    checkDMG: any,
    children?: React.ReactElement
}

interface IState {
    tabs: any,
    showSyncNotification: boolean,
    syncingProfile: boolean,
}

class ProfileInfo extends React.Component<IProps, IState> {
  currentParams: any;

  constructor(props) {
    super(props);
    const { search } = history.location;
    this.currentParams = search ? QueryString.parse(search) : {};
    this.state = {
      tabs: [{
        id: 1,
        title: 'OVERVIEW',
        render: this.renderOverviewTab,
      }],
      showSyncNotification: true,
      syncingProfile: false
    };
  }

  componentDidMount() {
    const user = this.props.selectedProfile || {};
    const fullName = `${user.first_name} ${user.last_name}`;
    if (this.currentParams) {
      const { action } = this.currentParams;
      const { source } = this.currentParams;
      if (action === 'view_profile' && source === 'slack') {
        // Add amplitude event
        emitter.emit(EVENT_KEYS.VIEW_PROFILE_FROM_SLACK, {
          userId: this.props.authUser.id,
        });
      }
    }
  }

  syncProfile = async () => {
    this.setState({
        syncingProfile: true,
        showSyncNotification: false
    });
    await ProfileService.syncProfile({ user_id: this.props.selectedProfile.id });
  };

  sendMessage = async () => {
    const base = config.appUrl;
    const { authUser, checkDMG, selectedProfile } = this.props;
    let dmgSlug;
    try {
      // dm exist
      const dmg = await checkDMG([selectedProfile.id, authUser.id]);
      dmgSlug = dmg.slug;
    } catch(err) {
      // Generate dm new Slug
      dmgSlug = Base64.encode(JSON.stringify({dmUserId: selectedProfile.id}));
    }
    window.open(`${base}${CHAT_PATH}/${dmgSlug}`, '_blank');
  };

  renderOverviewTab = () => <ProfileOverviewTab />;

  renderSyncNotification = (status) => {
    let icon;
    let message;
    if (status === 200) {
      icon = <i className="fa fa-check-circle mr-2 text-success" />;
      message = 'Profile successfully updated, now your informations are up-to-date';
    } else {
      icon = <i className="fa fa-times-circle text-danger mr-2" />;
      message = `Something went wrong, try again in a few second (${status})`;
    }
    return (
      <span>
        {icon}
        {' '}
        {message}
        <i className="fa fa-times ml-2" onClick={() => this.setState({ showSyncNotification: false })} />
      </span>
    );
  };

  render() {
    const { authUser, selectedProfile, children } = this.props;
    const { tabs } = this.state;

    const user = JSON.stringify(selectedProfile) !== '{}' ? selectedProfile : authUser;
    const fullName = `${user.first_name} ${user.last_name}`;

    const profile = user.profile || {};
    const { profile_image }= profile;

    const profileImageLink =
        (profile_image && profile_image !== '')
        ? profile_image
        : DEFAULT_PROFILE_IMAGE_URL;

    // Calculate scraping service related fields
    const now = new Date();
    const lastScrapedTime = user.last_scraped_time && new Date(user.last_scraped_time);
    const syncingProfile = this.state.syncingProfile
        || (user.last_profile_sync_request
        && (!lastScrapedTime || lastScrapedTime < new Date(user.last_profile_sync_request))
      );
    const showSyncNotification =
        !syncingProfile
        && this.state.showSyncNotification
        && canManagePlatform(authUser)
        && differenceInHours(now, lastScrapedTime) < 1;

    return (
      <div className="profile--container">
        {showSyncNotification
          && (
          <div className="profile--container--sync-notification">
            {this.renderSyncNotification(user.last_scraped_status)}
          </div>
          )}
        <img
          className="profile--image"
          src={profileImageLink}
          alt="Profile"
          width="100px"
        />
        <h6>{fullName}</h6>
        {getCurrentPositions(user).map((experience, id) => (
          <p key={id} className="mb-0">
            {[experience.position, experience.employer].join(' - ')}
          </p>
        ))}
        {canSeeNewsFeed(authUser) && (
          <div className="user-info--reputation mt-2">
            <img src={STAR_URL} alt="Heart" />
            <span>
              {user.reputation}
              {' '}
              Thanks
            </span>
          </div>
        )}
        {authUser.id && user.id && authUser.id !== user.id && (
            <button
              className="btn btn-primary mt-2 mb-2 px-4"
              type="button"
              onClick={this.sendMessage}
            >
              <img src={SEND_DM_MESSAGE_URL} alt="Heart" className="mr-1" />
              Message
            </button>
        )}

        {children}

        <br />
        {canManagePlatform
          && (
          <button
            className="btn btn-primary pull-right"
            type="button"
            onClick={this.syncProfile}
            disabled={syncingProfile}
          >
            {syncingProfile ? 'Requested' : 'Sync profile'}
          </button>
        )}

        <Tabs tabs={tabs} />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    authUser: get(state, 'authUser') || {},
    selectedProfile: get(state, 'selectedProfile') || {}
  };
};

const mapDispatchToProps = {
    checkDMG,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileInfo);
