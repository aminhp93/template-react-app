import React from 'react';
import PropTypes from 'prop-types';
import toastr from 'toastr';
import Modal from 'components/Modal';
import Discard from 'components/Modals/Discard';
import GuestForm from 'components/Events/GuestForm';
import GuestItem from 'components/Events/GuestItem';
import emitter, { EVENT_KEYS } from 'utils/event';
import userInfo from 'utils/userInfo';
import EventService from 'services/Event';
import { ResponseCode, GuestTypes } from 'constants/common';


const defaultGuest = {
  key: 1,
  full_name: '',
  email: '',
  type: GuestTypes.ADULT,
};


class InviteGuest extends React.Component {
  state = {
    guests: [defaultGuest],
    discardModal: false,
    dirty: false,
    errors: [{}],
    selectMode: false,
    prioritizedList: [],
    spaces: 0,
  };

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.showBrowserCloseModal);
  }

  addBrowserCloseModalListener = () => {
    window.addEventListener('beforeunload', this.showBrowserCloseModal);
  };

  showBrowserCloseModal = (e) => {
    const event = e || window.event;
    // For IE and Firefox prior to version 4
    if (event) {
      event.returnValue = 'Are you sure you want to leave and discard your draft?';
    }
    // For Safari
    return 'Are you sure you want to leave and discard your draft?';
  };

  showDiscardModal = () => this.setState({ discardModal: true });

  hideDiscardModal = () => this.setState({ discardModal: false });

  handleGuestChange = (guestIndex, updatedGuest) => {
    this.setState({
      guests: this.state.guests.map((guest, index) => (index === guestIndex ? updatedGuest : guest)),
      dirty: true,
    }, () => this.addBrowserCloseModalListener());
  };

  togglePrioritizedList = (guestIndex) => {
    let prioritizedList = [...this.state.prioritizedList];
    if (!prioritizedList.includes(guestIndex)) {
      prioritizedList.push(guestIndex);
      if (prioritizedList.length > this.state.spaces) prioritizedList.shift();
    } else prioritizedList = prioritizedList.filter((i) => i !== guestIndex);
    this.setState({ prioritizedList });
  };

  addGuest = () => {
    this.setState({
      guests: [...this.state.guests, { ...defaultGuest, key: this.state.guests.length + 1 }],
      errors: [...this.state.errors, {}],
    }, () => this.currentGuest && this.currentGuest.scrollIntoView({ behavior: 'smooth' }));
  };

  removeGuest = (index) => {
    const guests = [...this.state.guests];
    const errors = [...this.state.errors];
    guests.splice(index, 1);
    errors.splice(index, 1);
    this.setState({ guests, errors });
  };

  validate() {
    const allErrors = [];
    this.state.guests.forEach((guest) => {
      const errors = {};
      if (guest.full_name === '') {
        errors.full_name = 'You need to provide the name.';
      }
      if (!guest.type) {
        errors.type = 'You need to choose an option.';
      } else if (guest.type === GuestTypes.ADULT) {
        if (guest.email === '') {
          errors.email = 'You need to provide the email.';
        }
      }
      allErrors.push(errors);
    });
    this.setState({ errors: allErrors });
    return allErrors.reduce((total, errors) => total + Object.keys(errors).length, 0) === 0;
  }

  invite = () => {
    if (this.validate()) {
      this.setState({ loading: true });
      const data = this.state.guests.map((_guest, index) => {
        const guest = { ..._guest };
        if (this.state.selectMode) {
          guest.prioritized = this.state.prioritizedList.includes(index);
        }
        delete guest.key;
        return guest;
      });
      EventService.inviteGuests(this.props.eventSlug, data).then(() => {
        const { guests } = this.state;
        const text = (guests && guests.length === 1) ? 'guest' : 'guests';
        toastr.success(`You have invited ${guests.length} ${text} to the event.`);
        this.props.onInviteSuccess();
        // Add amplitude event
        emitter.emit(EVENT_KEYS.INVITE_GUEST_EVENTS, {
          userId: userInfo.getUserId(),
          eventId: this.props.eventId,
          eventName: this.props.eventName,
        });
      }).catch((e) => {
        const error = e.response.data;
        if (error && error.code === ResponseCode.NOT_ENOUGH_SPACES) {
          this.setState({ selectMode: true, spaces: error.data.spaces });
        }
        this.setState({ loading: false });
      });
    }
  };

  render() {
    const { isOpen, close } = this.props;
    const {
      guests, errors, selectMode, spaces,
    } = this.state;
    return (
      <Modal isOpen={isOpen} close={this.state.dirty ? this.showDiscardModal : close} title="Invite guest">
        <div id="inviteGuestModal">
          {selectMode
            ? (
              <div className="mb-3 mx-2 text-left">
                There are only
                {' '}
                <b>
                  {spaces}
                  {' '}
                  spaces left
                </b>
                , you can choose who can go and the rest will be moved to the waitlist.
              </div>
            )
            : (
              <div className="mb-3 text-left">
                You are inviting
                {' '}
                <b>
                  {guests.length}
                  {' '}
                  guest
                  {guests.length > 1 ? 's' : ''}
                </b>
                {' '}
                to this event.
              </div>
            )}
          <div style={{ overflowY: 'scroll', maxHeight: '500px' }}>
            {guests.map((guest, index) => (selectMode
              ? (
                <GuestItem
                  key={guest.key}
                  guest={guest}
                  onToggle={() => this.togglePrioritizedList(index)}
                  checked={this.state.prioritizedList.includes(index)}
                />
              )
              : (
                <GuestForm
                  key={guest.key}
                  index={index}
                  element={(el) => this.currentGuest = el}
                  guest={guest}
                  errors={errors[index]}
                  onChange={(info) => this.handleGuestChange(index, info)}
                  onRemove={this.removeGuest}
                />
              )
            ))}
          </div>
          <div className="mt-3 mb-4">
            {!selectMode
            && (
            <button
              id="inviteModalguestButton"
              className="btn aqua-bg text-white btn-lg mr-3 pull-left"
              type="button"
              onClick={this.addGuest}
              disabled={guests.length >= 20}
            >
              <i className="fa fa-plus fa-lg" />
            </button>
            )}
            <button
              id="inviteModalcancelButton"
              className="btn btn-light btn-lg pull-right"
              onClick={this.state.dirty ? (selectMode ? () => this.setState({ selectMode: false }) : this.showDiscardModal) : close}
              type="button"
            >
              Back
            </button>
            <button
              id="inviteModalInviteButton"
              className="btn btn-primary btn-lg pull-right mr-3 mb-3"
              type="button"
              onClick={this.invite}
              disabled={this.state.loading}
            >
              Invite
            </button>
          </div>
          <Discard
            target="invitation"
            isOpen={this.state.discardModal}
            close={this.hideDiscardModal}
            confirm={close}
          />
        </div>
      </Modal>
    );
  }
}

InviteGuest.propTypes = {
  isOpen: PropTypes.bool,
  close: PropTypes.func.isRequired,
  eventSlug: PropTypes.string,
  eventId: PropTypes.number,
  eventName: PropTypes.string,
  onInviteSuccess: PropTypes.func.isRequired,
};

export default InviteGuest;
