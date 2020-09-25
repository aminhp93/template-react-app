import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

class MessagingModal extends React.Component {
  componentDidMount() {
    const {
      buttonClose,
    } = this.props;
    if (buttonClose) {
      document.addEventListener('mousedown', this.close);
    }
  }

  componentWillUnmount() {
    const {
      buttonClose,
    } = this.props;
    if (buttonClose) {
      document.addEventListener('mousedown', this.close);
    }
  }

  close = (e) => {
    if (!this.props.unclosable && this.modalDialogRef && !this.modalDialogRef.contains(e.target)) {
      this.props.close();
    }
  };

  render() {
    const {
      id, isOpen, size, title, close, children, buttonClose,
    } = this.props;
    if (isOpen === false) return null;
    const hasHeader = !!title;

    return (
      <div
        id={id}
        tabIndex="-1"
        className="modal messaging-modal fade show d-flex"
      >
        <div
          className={`modal-dialog ${size}`}
          role="document"
          ref={(ref) => this.modalDialogRef = ref}
        >
          <div className="modal-content">
            { buttonClose && (
            <div className={clsx('modal-header', { 'modal-title': hasHeader })}>
              <div className="ml-auto pointer">
                <i id="modalCloseButton" className="fa fa-times fa-2x" onClick={close} />
              </div>
            </div>
            ) }
            <div className="modal-body">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

MessagingModal.propTypes = {
  close: PropTypes.func.isRequired,
  buttonClose: PropTypes.bool,
  id: PropTypes.string,
  isOpen: PropTypes.bool,
  children: PropTypes.element,
  title: PropTypes.string,
  size: PropTypes.string,
};

MessagingModal.defaultProps = {
  size: 'modal-lg',
  buttonClose: true,
};

export default MessagingModal;
