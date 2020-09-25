import { isEmail } from 'utils/validator';
import UserInfo from 'utils/userInfo';
import { EventStatus } from 'constants/common';

export const getSpaceText = (space) => {
  if (space === 0) return 'Fully Booked';
  if (!space) return 'Unlimited space';
  return `${space} spaces left`;
};

export const getSessionTree = (sessions) => {
  const sessionTree = {};
  sessions.forEach((session) => {
    if (sessionTree[session.year]) {
      if (sessionTree[session.year][session.name]) {
        sessionTree[session.year][session.name].push(session);
      } else {
        sessionTree[session.year][session.name] = [session];
      }
    } else {
      sessionTree[session.year] = {};
      sessionTree[session.year][session.name] = [session];
    }
  });
  return sessionTree;
};

export const mapEvent = (eventObj) => {
  const event = eventObj;
  event.booked = event.reservations.filter((reservation) => reservation.user.id === UserInfo.getUserId() && !reservation.guest_info).length > 0;
  event.waited = event.queuers.filter((queuer) => queuer.user.id === UserInfo.getUserId() && !queuer.guest_info).length > 0;
  // Pre-calculate lists for later usage.
  event.reservedGuests = [];
  event.reservedUsers = [];
  event.reservations.forEach((reservation) => {
    if (!reservation.guest_info) event.reservedUsers.push(reservation);
    else event.reservedGuests.push(reservation);
  });
  event.guestReservationIds = event.reservedGuests.map((r) => r.id);

  const invitedReservedGuests = event.reservedGuests
    .filter((guest) => guest.user.id === UserInfo.getUserId())
    .map((guest) => ({ ...guest, type: 'reservation' }));
  const invitedQueuedGuests = event.queuers
    .filter((queuer) => queuer.user.id === UserInfo.getUserId() && !!queuer.guest_info)
    .map((guest) => ({ ...guest, type: 'queuer' }));
  event.invitedGuests = invitedReservedGuests.concat(invitedQueuedGuests);
  return event;
};

export const validateEventForm = (eventStatus, event) => {
  const errors = {};
  if (event.name === '') {
    errors.name = 'Please provide the event name.';
  }
  if (event.sessions.length === 0) {
    errors.sessions = 'Please choose at least 1 session.';
  }
  const timeFields = ['start_time', 'end_time', 'time_zone'].filter((key) => event[key]);
  if (eventStatus === EventStatus.PUBLISHED) {
    if (event.about === '') {
      errors.about = 'Please provide the event description.';
    }
    if (timeFields.length === 0) {
      errors.date_time = 'Please provide the specific time.';
    }
    if (!event.location_id || event.address === '') {
      errors.location = 'Please provide the location.';
    }
    if (event.contact === '') {
      errors.contact = 'Please provide an email.';
    }
  }
  if (timeFields.length > 0 && timeFields.length < 3) {
    errors.date_time = 'Please provide the specific time.';
  }
  if (timeFields.length === 3) {
    if (Date.parse(event.start_time) >= Date.parse(event.end_time)) {
      errors.date_time = 'Start time should be earlier than end time.';
    } else if (event.last_rsvp_time) {
      if (Date.parse(event.last_rsvp_time) > Date.parse(event.start_time)) {
        errors.date_time = 'Last RSVP time should be earlier than start time.';
      }
    }
  }
  if (event.contact && !isEmail(event.contact)) {
    errors.contact = 'Please provide a valid email.';
  }
  return errors;
};
