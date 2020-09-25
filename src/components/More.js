import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

export const MoreItem = ({ onClick, children }) => (
  <li
    aria-label={children}
    className="more-dropdown__item cursor-pointer px-2 py-1"
    onClick={onClick}
  >
    {children}
  </li>
);

MoreItem.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
};

class More extends PureComponent {
  state = {
    open: false,
  };

  // When the popover is open and users click anywhere on the page,
  // the popover should close
  componentDidMount() {
    document.addEventListener('click', this.closePopover);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.closePopover);
  }

  // Note: make sure whenever a click happens within the popover it is not closed
  openPopover = () => {
    if (!this.state.open) {
      this.preventNextClose = true;
      this.setState({ open: true });
    }
  };

  closePopover = () => {
    if (!this.preventNextClose && this.state.open) {
      this.setState({
        open: false,
      });
    }

    this.preventNextClose = false;
  };

  render() {
    const { open } = this.state;
    const { children, containerClass } = this.props;

    return (
      <div className={clsx('more-component chat-tab-title', containerClass)} onClick={this.openPopover}>
        <a className={clsx('more-button py-1 px-2', { active: open })}>
          <i className="fa fa-ellipsis-v" style={{ fontSize: '28px' }} />
        </a>
        <ul className={clsx('dropdown-menu more-dropdown', { show: open })}>
          { children }
        </ul>
      </div>
    );
  }
}

More.propTypes = {
  children: PropTypes.node.isRequired,
  containerClass: PropTypes.string,
};

export default More;
