import React from 'react';
import PropTypes from 'prop-types';
import toastr from 'toastr';
import Modal from 'components/Modal';
import RadioButton from 'components/RadioButton';
import ConfirmCancel from 'components/Modals/ConfirmCancel';
import SessionBadge from 'components/SessionBadge';
import { GuestTypes, DEFAULT_PROFILE_IMAGE_URL } from 'constants/common';
import EventService from 'services/Event';
import UserInfo, { getUserNameDisplay, getPositionDisplay } from 'utils/userInfo';


class GuestInfo extends React.Component {
  state = {
    confirmCancelModal: false,
    loading: false,
  };

  showConfimCancelModal = () => this.setState({ confirmCancelModal: true });

  hideConfirmCancelModal = () => this.setState({ confirmCancelModal: false });

  cancelInvitation = () => {
    this.setState({ loading: true });
    EventService.removeGuest(this.props.eventSlug, {
      status: this.props.reserved ? 'reserved' : 'wait_list',
      id: this.props.guest.id,
    }).then(() => {
      toastr.success('Cancel invitation successfully');
      this.props.onCancelSuccess();
    }).catch(() => this.setState({ loading: false }));
  };

  render() {
    const {
      isOpen, close, cancelDisabled, guest: { guest_info: guest, user },
    } = this.props;
    return (
      <Modal id="guestModal" isOpen={isOpen} close={close} title="Guest Information">
        <>
          <div className="my-2">
            <span className="font-weight-bold">
              • Guest
            </span>
            <div className="form-group">
              <input
                className="form-control mt-2"
                placeholder="Full name"
                type="text"
                value={guest.full_name}
                name="full_name"
                disabled
              />
            </div>
            <div className="form-group">
              <input
                className="form-control mt-2"
                placeholder="Email"
                type="text"
                value={guest.email}
                name="email"
                disabled
              />
            </div>
            <div className="form-group">
              <RadioButton
                className="ml-2"
                style={{ marginTop: '1.2rem' }}
                checked={guest.type === GuestTypes.ADULT}
              />
              <span className="mr-4 ml-1">Adult</span>
              <RadioButton
                className="ml-1"
                style={{ marginTop: '1.2rem' }}
                checked={guest.type === GuestTypes.MINOR}
              />
              <span className="ml-1">Minor</span>
            </div>
            <span className="font-weight-bold">
              • Inviter
            </span>
            <div className="feed-post--actor" style={{ paddingLeft: '0', border: 'none' }}>
              <div className="feed-post--actor__image">
                <a href={`/profile/${user.id}`} target="_blank" rel="noreferrer">
                  <img src={user.profile_image || DEFAULT_PROFILE_IMAGE_URL} alt={getUserNameDisplay(user)} className="rounded-image" />
                </a>
              </div>
              <div className="feed-post--actor__meta">
                <h4 className="feed-post--actor__title">
                  <a href={`/profile/${user.id}`} target="_blank" rel="noreferrer">
                    <span className="actor__name">{getUserNameDisplay(user)}</span>
                  </a>
                  <SessionBadge creator={user} />
                </h4>
                <div className="feed-post--actor__description">
                  <span className="actor__position">{getPositionDisplay(user)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 mb-4 text-right">
            {!cancelDisabled && UserInfo.getUserId() === user.id
              && (
              <button
                id="inviteModalInviteButton"
                className="btn btn-danger btn-lg mr-3"
                type="button"
                onClick={this.showConfimCancelModal}
              >
                Cancel invitation
              </button>
              )}
            <button
              id="inviteModalcancelButton"
              className="btn btn-light btn-lg"
              onClick={close}
              type="button"
            >
              Back
            </button>
          </div>
          {this.state.confirmCancelModal
            && (
            <ConfirmCancel
              title="Cancel invitation"
              target="invitation"
              isOpen={this.state.confirmCancelModal}
              close={this.hideConfirmCancelModal}
              confirm={this.cancelInvitation}
              loading={this.state.loading}
            />
            )}
        </>
      </Modal>
    );
  }
}

GuestInfo.propTypes = {
  isOpen: PropTypes.bool,
  close: PropTypes.func,
  guest: PropTypes.objectOf(PropTypes.any),
  eventSlug: PropTypes.string,
  reserved: PropTypes.bool,
  onCancelSuccess: PropTypes.func,
  cancelDisabled: PropTypes.bool,
};

export default GuestInfo;
