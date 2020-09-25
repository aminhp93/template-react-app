import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

export const CheckboxState = {
  CHECKED: 'checked',
  HALFCHECKED: 'halfchecked',
  UNCHECKED: 'unchecked',
};

// Return either checked or unchecked
export const computeState = (checked) => (checked ? CheckboxState.CHECKED : CheckboxState.UNCHECKED);

export const computeParentState = (children, checkedChildren) => {
  // May return an extra state halfchecked
  if (children === checkedChildren) return CheckboxState.CHECKED;
  if (checkedChildren === 0) return CheckboxState.UNCHECKED;
  return CheckboxState.HALFCHECKED;
};

export const computeParentNextState = (currentState) => {
  // Return either checked or unchecked
  if (currentState === CheckboxState.CHECKED) return CheckboxState.UNCHECKED;
  return CheckboxState.CHECKED;
};

const Checkbox = ({
  label, state, onChange, className, style,
}) => {
  let icon = 'square-o';
  if (state === CheckboxState.HALFCHECKED) icon = 'minus-square';
  if (state === CheckboxState.CHECKED) icon = 'check-square';
  return (
    <span style={style} className={className} onClick={onChange}>
      <i className={clsx(`fa fa-${icon} fa-lg pointer`, { 'text-link': icon !== 'square-o' })} />
      {label && <label className="form-control-label ml-2 pointer">{label}</label>}
    </span>
  );
};

Checkbox.propTypes = {
  label: PropTypes.string,
  state: PropTypes.oneOf(Object.values(CheckboxState)).isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.any),
};

export default Checkbox;
