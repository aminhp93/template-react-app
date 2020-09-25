import * as Sentry from '@sentry/react';
import * as React from 'react';

interface IProps {
  label?: string;
  checked?: boolean;
  className?: string;
  onClick?: any;
  style?: any;
}

class RadioButton extends React.PureComponent<IProps> {
  render() {
    const { label, checked, onClick, className, style } = this.props;
    const icon = checked ? 'dot-circle-o' : 'circle-o';

    return (
      <span style={style} className={className} onClick={onClick}>
        <i
          className={`fa fa-${icon} fa-lg pointer ${
            icon !== 'circle-o' ? 'text-link' : ''
          }`}
        />
        {label && (
          <label className="form-control-label ml-2 pointer">{label}</label>
        )}
      </span>
    );
  }
}

export default Sentry.withProfiler(RadioButton, { name: "RadioButton"});
