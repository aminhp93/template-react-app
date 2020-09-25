import React from 'react';
import PropTypes from 'prop-types';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import ReactToPrint from 'react-to-print';
import EventService from 'services/Event';
import history from 'utils/history';
import makePageTitle from 'utils/common';
import LoadingIndicator from 'components/LoadingIndicator';
import PrintPage from './PrintPage';

const logger = new Logger('Event');

const compareUserNames = (a, b) => {
  const userAFirstName = a.user.first_name.toUpperCase();
  const userALastName = a.user.last_name.toUpperCase();
  const userBFirstName = b.user.first_name.toUpperCase();
  const userBLastName = b.user.last_name.toUpperCase();
  if (userAFirstName === userBFirstName) {
    if (userALastName === userBLastName) return 0;
    return userALastName > userBLastName ? 1 : -1;
  }
  return userAFirstName > userBFirstName ? 1 : -1;
};

class EventPrint extends React.Component {
  state = {
    event: {},
  };

  componentDidMount() {
    this.fetchEvent();
  }

  fetchEvent() {
    const { slug } = this.props.match && this.props.match.params;
    if (!slug) history.push('/events');
    this.setState({ fetching: true });
    EventService.getEventDetail(slug).then((res) => {
      if (res.data) {
        const event = res.data;
        // Handle reservations
        event.reservations.map((r) => ({ ...r, type: 'reservation' }));
        event.reservedUsers = [];
        event.reservedGuests = [];
        event.reservations.forEach((r) => {
          if (!r.guest_info) event.reservedUsers.push(r);
          else event.reservedGuests.push(r);
        });
        // Handle queuers
        event.queuers = event.queuers.map((p) => ({ ...p, type: 'queuer' }));
        event.queuedUsers = [];
        event.queuedGuests = [];
        event.queuers.forEach((q) => {
          if (!q.guest_info) event.queuedUsers.push(q);
          else event.queuedGuests.push(q);
        });

        // Sort participant list alphabetically
        event.users = event.reservedUsers.concat(event.queuedUsers).sort(compareUserNames);
        // Concat guest list and pre-calculate no-inviter guest list
        event.guests = event.reservedGuests.concat(event.queuedGuests);
        event.guestReservationIds = event.reservedGuests.map((r) => r.id);
        const eventUserIds = event.users.map((r) => r.user.id);
        event.noInviterGuests = event.guests.filter((g) => !eventUserIds.includes(g.user.id));
        this.setState({ event, fetching: false }, () => {
          document.title = makePageTitle(this.state.event.name);
        });
      } else {
        throw new Error('No response data');
      }
    }).catch((e) => {
      history.push('/events');
      logger.error(e);
    });
  }

  render() {
    const { event, fetching } = this.state;
    const eventLoaded = event && Object.keys(event).length > 0;
    return (
      <div className="main-page">
        <div
          className="container position-relative my-3"
          style={{ width: '911px', minHeight: '1289px', border: 'solid 1px #979797' }}
        >
          {fetching && !eventLoaded && <LoadingIndicator />}
          <ReactToPrint
            trigger={() => (
              <button className="btn btn-primary print-preview-btn">
                <i className="fa fa-print fa-lg mr-2" />
                Print
              </button>
            )}
            content={() => this.printRef}
          />
          {eventLoaded && <PrintPage event={event} ref={(ref) => this.printRef = ref} />}
        </div>
      </div>
    );
  }
}

EventPrint.propTypes = {
  match: PropTypes.objectOf(PropTypes.any),
};

export default EventPrint;
