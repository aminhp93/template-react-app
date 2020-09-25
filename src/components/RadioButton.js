import * as React from 'react';
import clsx from 'clsx';

const RadioButton = ({
  label, checked, onClick, className, style,
}) => {
  const icon = checked ? 'dot-circle-o' : 'circle-o';
  return (
    <span style={style} className={className} onClick={onClick}>
      <i className={clsx(`fa fa-${icon} fa-lg pointer`, { 'text-link': icon !== 'circle-o' })} />
      {label && <label className="form-control-label ml-2 pointer">{label}</label>}
    </span>
  );
};

RadioButton.defaultProps = {
  onClick: () => {},
};

export default RadioButton;
