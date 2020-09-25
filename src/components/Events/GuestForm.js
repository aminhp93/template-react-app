import React from 'react';
import PropTypes from 'prop-types';
import InputErrorMessage from 'components/InputErrorMessage';
import RadioButton from 'components/RadioButton';
import { GUEST_TYPES } from 'constants/common';


const GuestForm = (props) => {
  const { guest, index, errors } = props;

  const handleChange = (name, value) => {
    props.onChange({ ...guest, [name]: value });
  };

  const handleInputChange = (e) => handleChange(e.target.name, e.target.value);

  const renderRadioButton = (guestType) => {
    const handleClick = () => guest.type !== guestType && handleChange('type', guestType);
    return (
      <React.Fragment key={guestType}>
        <RadioButton
          className="ml-2"
          style={{ marginTop: '1.2rem' }}
          checked={guest.type === guestType}
          onClick={handleClick}
        />
        <span className="mr-4 ml-1 pointer" onClick={handleClick}>
          {`${guestType.charAt(0).toUpperCase()}${guestType.slice(1)}`}
        </span>
      </React.Fragment>
    );
  };

  return (
    <div className="my-2" ref={(ref) => props.element(ref)}>
      <span className="font-weight-bold">
        • Guest
        {' '}
        {index + 1}
        {index !== 0
          && <i className="fa fa-minus-square aqua ml-2 pointer" onClick={() => props.onRemove(index)} />}
      </span>
      <div className="form-group">
        <input
          className="form-control mt-2"
          placeholder="Full name"
          type="text"
          value={guest.full_name}
          name="full_name"
          onChange={handleInputChange}
        />
        {errors.full_name
          && (
          <div className="my-1 ml-2 text-sm">
            <InputErrorMessage>
              *
              {errors.full_name}
            </InputErrorMessage>
          </div>
          )}
      </div>
      <div className="form-group">
        <input
          className="form-control mt-2"
          placeholder="Email"
          type="text"
          value={guest.email}
          name="email"
          onChange={handleInputChange}
        />
        {errors.email
          && (
          <div className="my-1 ml-2 text-sm">
            <InputErrorMessage>
              *
              {errors.email}
            </InputErrorMessage>
          </div>
          )}
      </div>
      <div className="form-group">
        {GUEST_TYPES.map(renderRadioButton)}
        {errors.type
          && (
          <div className="my-1 ml-2 text-sm">
            <InputErrorMessage>
              *
              {errors.type}
            </InputErrorMessage>
          </div>
          )}
      </div>
    </div>
  );
};

GuestForm.propTypes = {
  guest: PropTypes.objectOf(PropTypes.any),
  index: PropTypes.number,
  errors: PropTypes.objectOf(PropTypes.any),
  onChange: PropTypes.func,
  onRemove: PropTypes.func,
  element: PropTypes.func,
};

export default GuestForm;
