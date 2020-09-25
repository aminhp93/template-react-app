import React from 'react';
import PropTypes from 'prop-types';
import MessagingModal from 'components/MessagingModal';

import CHANNEL_MENTION_IMAGE_URL from '@img/channel-mention.png';


const ChannelMention = ({ isOpen, onClose, onConfirm, numOfParticipants }) => (
  <MessagingModal isOpen={isOpen} id="unpinConfirm" close={onClose}>
    <div id="messageConfirmModal">
      <img src={CHANNEL_MENTION_IMAGE_URL} alt="Channel mention image" className="channel-mention-warning-image" />
      <div className="mb-4 text-left ml-1 mb-2 channel-mention-warning-text">
        By using <b>@channel</b>, you are about to notify <b>{numOfParticipants} people</b>. Are you sure?
      </div>
      <div className="text-right mt-3 mb-2">
        <button
          id="confirmButton"
          className="btn btn-light btn-lg mr-3"
          type="button"
          onClick={onClose}
        >
          Edit message
        </button>
        <button
          id="confirmCancelButton"
          className="btn btn-primary btn-lg"
          onClick={onConfirm}
          type="button"
        >
          Send it now
        </button>
      </div>
    </div>
  </MessagingModal>
);

ChannelMention.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  numOfParticipants: PropTypes.number.isRequired,
};

export default ChannelMention;
