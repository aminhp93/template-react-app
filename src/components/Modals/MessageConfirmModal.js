import React from 'react';
import PropTypes from 'prop-types';
import MessagingModal from 'components/MessagingModal';

class MessageConfirmModal extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    action: PropTypes.string.isRequired,
    target: PropTypes.string.isRequired,
    close: PropTypes.func.isRequired,
    confirm: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { isSubmitting: false };
  }

  onConfirm = () => {
    this.setState({ isSubmitting: true });
    this.props.onConfirm();
  };

  render() {
    const {
      isOpen, close, action, target, confirm, loading,
    } = this.props;
    return (
      <MessagingModal isOpen={isOpen} id="unpinConfirm" close={close}>
        <div id="messageConfirmModal">
          <h4 className="mb-3">
            {action.charAt(0).toUpperCase()}
            {action.slice(1)}
            {' '}
            {target}
          </h4>
          <div className="mb-4 text-left ml-1 mb-2">
            Are you sure you want to
            {' '}
            {action}
            {' '}
            this
            {' '}
            {target}
            ?
          </div>
          <div className="text-right mt-3 mb-2">
            <button
              id="confirmButton"
              className="btn btn-danger btn-lg mr-3"
              type="button"
              onClick={confirm}
              disabled={loading}
            >
              Remove
            </button>
            <button
              id="confirmCancelButton"
              className="btn btn-light btn-lg"
              onClick={close}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      </MessagingModal>
    );
  }
}

export default MessageConfirmModal;
