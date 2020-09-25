import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { getTimeInTimeZone } from 'utils/time';
import { GuestTypes } from 'constants/common';
import GuestInfo from 'components/Modals/GuestInfo';

import LOGO_DARK_URL from '@img/logo-dark.png';


const compareGuestNames = (a, b) => {
  const guestAFullName = a.guest_info.full_name.toUpperCase();
  const guestBFullName = b.guest_info.full_name.toUpperCase();
  if (guestAFullName === guestBFullName) return 0;
  return guestAFullName > guestBFullName ? 1 : -1;
};

class PrintPage extends React.Component {
  state = {
    currentGuest: null,
    guestModal: false,
  };

  showGuestModal = (guest) => {
    this.setState({ guestModal: true, currentGuest: guest });
  };

  renderUser = (p, userHasGuests, eventHasGuests) => (
    <tr className={clsx({ 'border-bottom-0': userHasGuests })}>
      <td className="long-text-cell">
        {p.user.first_name}
        {' '}
        {p.user.last_name}
      </td>
      <td className="text-center">{p.user.latest_session}</td>
      <td className="long-text-cell">
        {p.user.email}
      </td>
      <td className="p-0">
        {eventHasGuests
          ? (
            <div className="row mx-0" style={{ height: '36.67px' }}>
              <div className="col-6 text-center p-0">
                &nbsp;
                {p.type === 'queuer' && 'Waitlist'}
              </div>
              <div className="col-6 text-center p-0" style={{ borderLeft: '1px solid #979797' }}>
                &nbsp;
              </div>
            </div>
          )
          : (
            <div className="text-center p-2">
              {p.type === 'queuer' && 'Waitlist'}
            </div>
          )}
      </td>
    </tr>
  );

  renderGuest = (g, isLast) => (
    <tr className={clsx('guest-row', { 'border-bottom': isLast })} key={g.id}>
      <td className="pl-4 py-0 pointer" style={{ maxWidth: '300px' }} onClick={() => this.showGuestModal(g)}>
        <i className="fa fa-user mr-1 long-text-cell" />
        {' '}
        {g.guest_info.full_name}
      </td>
      <td />
      <td className="py-0 long-text-cell">{g.guest_info.email}</td>
      <td className="p-0">
        <div className="row mx-0" style={{ height: '30px' }}>
          <div className="col-6 text-center p-0">
            &nbsp;
            {g.type === 'queuer' && 'Waitlist'}
          </div>
          <div className="col-6 text-center p-0" style={{ borderLeft: '1px solid #979797' }}>
            &nbsp;
            {g.guest_info.type === GuestTypes.MINOR && 'Minor'}
          </div>
        </div>
      </td>
    </tr>
  );

  render() {
    const { currentGuest, guestModal } = this.state;
    const { event } = this.props;
    const startTime = getTimeInTimeZone(event.start_time, 'YYYY-MM-DD HH:mm:ss', event.time_zone);
    const endTime = getTimeInTimeZone(event.end_time, 'YYYY-MM-DD HH:mm:ss', event.time_zone);
    return (
      <div className="event-print-preview" style={{ color: '#4b5862' }}>
        <img
          src={LOGO_DARK_URL}
          className="img-responsive mb-2"
          alt="Insight Data Science"
          height="50px"
        />
        <div className="row">
          <div className="col-sm-9">
            <h3 className="my-3 font-weight-bold">{event.name}</h3>
            <div className="ml-1">
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
                <i className="fa fa-map-marker fa-lg mr-2" style={{ marginLeft: '.15rem' }} />
                {' '}
                {event.address}
              </p>
              <p>
                <i className="fa fa-envelope-o fa-lg mr-2" />
                {' '}
                {event.contact}
              </p>
            </div>
          </div>
          <div className="col-sm-3">
            <table className="border-0 event-print-statistics">
              <tbody>
                <tr>
                  <td>Total:</td>
                  <td>{event.reservations.length + event.queuers.length}</td>
                </tr>
                <tr className="border-top">
                  <td>Total going:</td>
                  <td>{event.reservations.length}</td>
                </tr>
                <tr>
                  <td>Total waitlist:</td>
                  <td>{event.queuers.length}</td>
                </tr>
                <tr className="border-top">
                  <td>Total guests:</td>
                  <td>{event.guests.length}</td>
                </tr>
                <tr className="border-top">
                  <td>Total adults:</td>
                  <td>{event.users.length + event.guests.filter((p) => p.guest_info.type === GuestTypes.ADULT).length}</td>
                </tr>
                <tr>
                  <td>Total minors:</td>
                  <td>{event.guests.filter((p) => p.guest_info.type === GuestTypes.MINOR).length}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <table className="event-print-table">
          <thead className="bg-gray">
            <tr>
              <th style={{ width: '30%' }}>Full name</th>
              <th style={{ width: '20%' }}>Session</th>
              <th style={{ width: '30%' }}>Email address</th>
              <th style={{ width: '20%' }}>Note</th>
            </tr>
          </thead>
          <tbody className="text-left">
            {event.noInviterGuests.length > 0
              && (
                <>
                  {this.renderUser({ user: { first_name: 'Inviter not joining' } }, true, event.guests.length > 0)}
                  {event.noInviterGuests
                    .sort(compareGuestNames)
                    .map((g, idx) => this.renderGuest(g, idx === event.noInviterGuests.length - 1))}
                </>
              )}
            {event.users.map((p) => {
              const userGuests = event.guests.filter((g) => g.user.id === p.user.id).sort(compareGuestNames);
              return (
                <React.Fragment key={p.id}>
                  {this.renderUser(p, userGuests.length > 0, event.guests.length > 0)}
                  {userGuests.map((g, idx) => this.renderGuest(g, idx === userGuests.length - 1))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {guestModal && currentGuest
          && (
          <GuestInfo
            guest={currentGuest}
            isOpen={guestModal}
            close={() => this.setState({ guestModal: false })}
            eventSlug={event.slug}
            reserved={event.guestReservationIds.includes(currentGuest.id)}
            onCancelSuccess={this.handleCancelInvitationSuccess}
            cancelDisabled
          />
          )}
      </div>
    );
  }
}

PrintPage.propTypes = {
  event: PropTypes.objectOf(PropTypes.any),
};

export default PrintPage;
