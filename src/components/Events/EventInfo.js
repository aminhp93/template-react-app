import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { format } from 'date-fns';
import EventService from 'services/Event';
import { DEFAULT_PROFILE_IMAGE_URL, GUEST_IMAGE_URL, EventType } from 'constants/common';
import history from 'utils/history';
import makePageTitle from 'utils/common';
import UserInfo from 'utils/userInfo';
import { getTimeInTimeZone } from 'utils/time';
import emitter, { EVENT_KEYS } from 'utils/event';
import userInfo from 'utils/userInfo';
import LoadingIndicator from 'components/LoadingIndicator';
import InviteModal from 'components/Modals/InviteGuest';
import GuestInfo from 'components/Modals/GuestInfo';
import { getSpaceText, mapEvent } from './utils';
import PeopleList from './PeopleList';

const logger = new Logger('Event');

class EventInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      event: {},
      dropdownOpen: false,
      rsvpDeadlineToolbox: false,
      notReservedToolbox: false,
      inviteGuestModal: false,
      guestModal: false,
      currentGuest: null,
      printDropdown: false,
    };
  }

  componentDidMount() {
    this.fetchEventInfo();
    window.document.addEventListener('click', this.hideDropDown);
    window.document.addEventListener('click', this.hidePrintDropdown);
  }

  componentWillUnmount() {
    window.document.removeEventListener('click', this.hideDropDown);
    window.document.removeEventListener('click', this.hidePrintDropdown);
  }

  fetchEventInfo() {
    const { slug } = this.props.match && this.props.match.params;
    if (!slug) history.push('/events');
    this.setState({ fetching: true });
    EventService.getEventDetail(slug).then((res) => {
      if (res.data) {
        const event = mapEvent(res.data);
        this.setState({ event, fetching: false }, () => {
          document.title = makePageTitle(this.state.event.name);
        });
        // Add amplitude event
        emitter.emit(EVENT_KEYS.VIEW_EVENT_DETAILS, {
          userId: userInfo.getUserId(),
          eventId: event.id,
          eventName: event.name,
        });
      } else {
        throw new Error('No response data');
      }
    }).catch((e) => {
      history.push('/events');
      logger.error(e);
    });
  }

  sendReservation = () => {
    EventService.createReservation(this.state.event.slug).then(((res) => {
      if (res.data) this.fetchEventInfo();
      // Add amplitude event
      emitter.emit(EVENT_KEYS.RSVP_EVENTS, {
        userId: userInfo.getUserId(),
        eventId: this.state.event.id,
        eventName: this.state.event.name,
      });
    })).catch((e) => logger.error(e));
  };

  removeReservation = () => {
    EventService.removeReservation(this.state.event.slug)
      .then((() => this.fetchEventInfo()))
      .catch((e) => logger.error(e));
  };

  togglePrintDropdown = () => this.setState({ printDropdown: !this.state.printDropdown });

  hidePrintDropdown = (e) => {
    if (this.printDropdownRef && !this.printDropdownRef.contains(e.target)) {
      this.setState({ printDropdown: false });
    }
  };

  toggleDropDown = () => this.setState({ dropdownOpen: !this.state.dropdownOpen });

  hideDropDown = (e) => {
    if (this.dropDownToggleRef && !this.dropDownToggleRef.contains(e.target)) {
      this.setState({ dropdownOpen: false });
    }
  };

  showInviteGuestModal = () => this.setState({ inviteGuestModal: true });

  hideInviteGuestModal = () => this.setState({ inviteGuestModal: false });

  handleInviteSuccess = () => {
    this.setState({
      inviteGuestModal: false,
    }, () => this.fetchEventInfo());
  };

  handleCancelInvitationSuccess = () => {
    this.setState({
      guestModal: false,
    }, () => this.fetchEventInfo());
  };

  showGuestModal = (guest) => {
    this.setState({ guestModal: true, currentGuest: guest });
  };

  renderInviteButton(event, isLateRSVP) {
    if (!event.allow_guests || isLateRSVP) return null;
    const { notReservedToolbox, inviteGuestModal } = this.state;
    return (
      <>
        <button
          className={clsx('btn event-invite-btn', { disabled: isLateRSVP })}
          onClick={isLateRSVP ? () => {} : this.showInviteGuestModal}
          onMouseEnter={() => this.setState({ notReservedToolbox: true })}
          onMouseLeave={() => this.setState({ notReservedToolbox: false })}
        >
          <i className="fa fa-user-plus fa-lg" />
        </button>
        {notReservedToolbox
          && (
          <div className="info-toolbox">
            Invite your friend to this event.
          </div>
          )}
        {inviteGuestModal
          && (
          <InviteModal
            isOpen={inviteGuestModal}
            close={this.hideInviteGuestModal}
            onInviteSuccess={this.handleInviteSuccess}
            eventSlug={event.slug}
            eventId={event.id}
            eventName={event.name}
          />
          )}
      </>
    );
  }

  renderUserItem = (user) => (
    <li key={user.id} className="scroll-list__item">
      <div style={{ display: 'flex' }}>
        <div className="user-avar-img">
          <img
            className="profile--image"
            src={user.profile_image || DEFAULT_PROFILE_IMAGE_URL}
            alt="Profile"
          />
        </div>
        <div className={clsx('event-user-info ml-1', { 'event-no-session-people-mt': !user.latest_session })}>
          <b style={{ marginTop: '5px' }}>
            {user.first_name}
            {' '}
            {user.last_name}
          </b>
          {' '}
          <br />
          <span>{user.latest_session}</span>
        </div>
      </div>
    </li>
  );

  renderGuestItem = (reservation, isInvited = null) => {
    const { guest_info: guest } = reservation;
    const canBeSeen = isInvited || UserInfo.isStaff() || reservation.user.id === UserInfo.getUserId();
    let image = DEFAULT_PROFILE_IMAGE_URL;
    if (isInvited && reservation.type === 'reservation') image = GUEST_IMAGE_URL;
    return (
      <li
        key={reservation.id}
        className={clsx('scroll-list__item', { pointer: canBeSeen })}
        style={{ display: 'flex' }}
        onClick={() => (canBeSeen ? this.showGuestModal(reservation) : {})}
      >
        <div className="user-avar-img">
          <img
            className="profile--image"
            src={image}
            alt="Guest"
          />
        </div>
        <div className={clsx('event-user-info ml-1', { 'event-no-session-people-mt': !isInvited })}>
          <b style={{ marginTop: '5px' }}>{canBeSeen ? guest.full_name : 'Guest'}</b>
          <br />
          {isInvited && (
          <span>
            (
            {reservation.type === 'reservation' ? 'Going' : 'Waitlist'}
            )
          </span>
          )}
        </div>
      </li>
    );
  };

  render() {
    const {
      event,
      fetching,
      currentGuest,
      guestModal,
      dropdownOpen,
      rsvpDeadlineToolbox,
      printDropdown,
    } = this.state;
    const eventLoaded = event && Object.keys(event).length > 0;
    const startTime = getTimeInTimeZone(event.start_time, 'YYYY-MM-DD HH:mm:ss', event.time_zone);
    const endTime = getTimeInTimeZone(event.end_time, 'YYYY-MM-DD HH:mm:ss', event.time_zone);
    const now = new Date();
    const isLateRSVP = event.last_rsvp_time && now > new Date(event.last_rsvp_time);
    return (
      <div className="main-page">
        {fetching && !eventLoaded && <LoadingIndicator />}
        {eventLoaded
        && (
        <div className="container event-detail-container" style={{ width: '700px' }}>
          <div
            className="event-detail-title mt-5"
            style={event.cover_image ? {
              backgroundImage: `linear-gradient(rgba(0, 0, 0, .3), rgba(0, 0, 0, .3)), url('${event.cover_image}')`,
            } : {}}
          >
            {UserInfo.isStaff()
              && (
                <>
                  <span className="print-btn">
                    <i
                      ref={(ref) => this.printDropdownRef = ref}
                      className="fa fa-print fa-lg"
                      onClick={this.togglePrintDropdown}
                    />
                  </span>
                  {printDropdown
                  && (
                  <div className="print-dropdown">
                    <div
                      className="print-dropdown-item pointer"
                      onClick={() => history.push(`/events/${event.slug}/print`)}
                    >
                      Preview & Print
                    </div>
                  </div>
                  )}
                </>
              )}
            {event.name}
          </div>
          <div style={{ display: 'flex', width: '100%' }}>
            <div className="event-detail-info">
              <p>
                <i className="fa fa-calendar fa-lg mr-2" />
                {format(startTime, 'dddd, MMMM D')}
              </p>
              <p>
                <i className="fa fa-clock-o fa-lg mr-2" />
                {format(startTime, 'h:mm a')}
                {' '}
                -
                {format(endTime, 'h:mm a')}
                {' '}
                {event.time_zone && event.time_zone.toUpperCase()}
              </p>
              <p>
                <i className="fa fa-map-marker fa-lg mr-2" />
                {' '}
                {event.address}
              </p>
              <p>
                <i className="fa fa-envelope-o fa-lg mr-2" />
                {' '}
                {event.contact}
              </p>
              <p
                className="mt-3"
                style={{ fontSize: '14px', fontWeight: 'bold' }}
              >
                ABOUT
              </p>
              <span style={{ whiteSpace: 'pre-wrap' }}>{event.about}</span>
            </div>
            <div className="event-going-waitlist">
              {event.type === EventType.UPCOMING
                && (
                  <>
                    {!event.booked && !event.waited
                      ? (event.can_reserve
                      && (
                        <>
                          <button
                            className={clsx('btn btn-primary event-reserve-btn', { disabled: isLateRSVP })}
                            style={!event.allow_guests ? { width: '100%' } : {}}
                            onClick={isLateRSVP ? () => {} : this.sendReservation}
                            onMouseEnter={() => this.setState({ rsvpDeadlineToolbox: true })}
                            onMouseLeave={() => this.setState({ rsvpDeadlineToolbox: false })}
                          >
                            {event.available_space === 0 ? 'Add me to waitlist' : 'RESERVE'}
                          </button>
                        </>
                      )
                      )
                      : (
                        <>
                          <button
                            ref={(ref) => this.dropDownToggleRef = ref}
                            className={clsx('btn btn-primary event-reserve-btn checked dropdown-toggle', { disabled: isLateRSVP })}
                            style={!event.allow_guests ? { width: '100%' } : {}}
                            onClick={isLateRSVP ? () => {} : this.toggleDropDown}
                            onMouseEnter={() => this.setState({ rsvpDeadlineToolbox: true })}
                            onMouseLeave={() => this.setState({ rsvpDeadlineToolbox: false })}
                          >
                            <i className="fa fa-check fa-lg" />
                            {event.booked && 'GOING'}
                            {event.waited && 'On Waitlist'}
                          </button>
                          {dropdownOpen
                        && (
                        <div className="remove-reserve-dropdown" onClick={this.removeReservation}>
                          {event.booked && 'Not going'}
                          {event.waited && 'Remove from waitlist'}
                        </div>
                        )}
                        </>
                      )}
                    {isLateRSVP && rsvpDeadlineToolbox
                    && (
                    <div className="info-toolbox">
                      Reservation for this event has closed.
                    </div>
                    )}
                    {this.renderInviteButton(event, isLateRSVP)}
                  </>
                )}
              <p
                className="text-center mt-2 mb-2"
                style={{ clear: 'both' }}
              >
                {getSpaceText(event.available_space)}
              </p>
              <PeopleList
                title={`${event.reservedUsers.length} people going${event.reservedGuests.length > 0 ? `\n${event.reservedGuests.length} guests going` : ''}`}
                content={event.reservedUsers.map((r) => r.user).map(this.renderUserItem)}
              />
              {UserInfo.isStaff() && event.reservedGuests.length > 0
                && (
                <PeopleList
                  title={`${event.reservedGuests.length} guests going`}
                  content={event.reservedGuests.map((r) => this.renderGuestItem(r))}
                />
                )}
              {event.invitedGuests && event.invitedGuests.length > 0
                && (
                <PeopleList
                  title={`Your guests (${event.invitedGuests.length} invited)`}
                  content={event.invitedGuests.map((r) => this.renderGuestItem(r, true))}
                />
                )}
              {event.queuers && event.queuers.length > 0
                && (
                <PeopleList
                  title="Waitlist"
                  content={
                    event.queuers.map((queuer) => {
                      const { user, guest_info: guest } = queuer;
                      if (guest) return this.renderGuestItem(queuer);
                      return this.renderUserItem(user);
                    })
                  }
                />
                )}
            </div>
          </div>
        </div>
        )}
        {guestModal && currentGuest
          && (
          <GuestInfo
            guest={currentGuest}
            isOpen={guestModal}
            close={() => this.setState({ guestModal: false })}
            eventSlug={event.slug}
            reserved={event.guestReservationIds.includes(currentGuest.id)}
            onCancelSuccess={this.handleCancelInvitationSuccess}
          />
          )}
      </div>
    );
  }
}

EventInfo.propTypes = {
  match: PropTypes.objectOf(PropTypes.any),
};

export default EventInfo;
