import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { DEFAULT_PROFILE_IMAGE_URL } from 'constants/common';
import Checkbox, { computeState } from 'components/Checkbox';

const GuestItem = (props) => {
  const { guest } = props;
  return (
    <div className={clsx('guest-item', { checked: props.checked })}>
      <img
        className="profile--image pointer ml-2"
        src={DEFAULT_PROFILE_IMAGE_URL}
        width="40px"
        alt="Guest"
      />
      <div className="ml-5 pl-2">
        {guest.full_name}
        {' '}
        <br />
        {guest.email}
      </div>
      <div className="guest-item--checkbox">
        <Checkbox onChange={props.onToggle} state={computeState(props.checked)} />
      </div>
    </div>
  );
};

GuestItem.propTypes = {
  guest: PropTypes.objectOf(PropTypes.any),
  onToggle: PropTypes.func.isRequired,
  checked: PropTypes.bool.isRequired,
};

export default GuestItem;
