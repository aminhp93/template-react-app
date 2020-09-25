import * as React from 'react';
import * as PropTypes from 'prop-types';

class Dialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired,
    onDismiss: PropTypes.func,
    onConfirm: PropTypes.func,
    title: PropTypes.string,
    loading: PropTypes.bool,
  };

  static defaultProps = {
    title: '',
  };

  componentDidMount() {
    document.addEventListener('mousedown', this.onDismiss);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onDismiss);
  }

  onDismiss = (e) => {
    if (this.modalDialogRef && !this.modalDialogRef.contains(e.target)) {
      this.props.onDismiss();
    }
  };

  render() {
    const {
      isOpen, title, text, onDismiss, onConfirm, loading,
    } = this.props;
    if (isOpen === false) return null;
    return (
      <div
        tabIndex="-1"
        className="modal fade show d-block dialog"
      >
        <div
          role="document"
          className="modal-dialog modal-60"
          ref={(ref) => this.modalDialogRef = ref}
        >
          <div className="modal-content">
            <div className="dialog-header">
              <div className="dialog-header__title">{title}</div>
              <div className="dialog-header__button">
                <i id="modalCloseButton" className="fa fa-times" onClick={onDismiss} />
              </div>
            </div>
            <div className="dialog-body">
              {text}
            </div>
            <div className="dialog-footer">
              <button
                className="btn btn-primary dialog-button confirm-button"
                onClick={(e) => onConfirm(e)}
                disabled={loading}
              >
                {`Yes, I'm sure`}
              </button>
              <button
                className="btn dialog-button discard-button"
                onClick={onDismiss}
                disabled={loading}
              >
                No, take me back
              </button>
            </div>
          </div>
        </div>

      </div>
    );
  }
}

export default Dialog;
