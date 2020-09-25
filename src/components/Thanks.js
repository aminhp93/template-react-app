import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import emitter, { EVENT_KEYS } from 'utils/event';

class Thanks extends React.Component {
  static propTypes = {
    thanked: PropTypes.bool,
    onClick: PropTypes.func,
    thanksCount: PropTypes.number,
    className: PropTypes.string,
  };

  state = {
    thanksAnimation: false,
  };

  handleClick = () => {
    if (this.props.onClick) {
      if (!this.props.thanked) {
        this.setState({ thanksAnimation: true });
        emitter.emit(EVENT_KEYS.THANK_NEWS_FEED_POST);
      }
      this.props.onClick();
    }
  };

  render() {
    return (
      <div
        className={clsx(`${this.props.className || ''}`, { pointer: !!this.props.onClick })}
        onClick={this.handleClick}
      >
        <span
          className={clsx('thanks', { is_animating: this.state.thanksAnimation, active: this.props.thanked })}
          onAnimationEnd={() => this.setState({ thanksAnimation: false })}
        />
        <span className="ml-3">{`${this.props.thanksCount || '0'}`}</span>
      </div>
    );
  }
}

export default Thanks;
