import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const sizeClasses = {
  lg: 'modal-60',
  sm: 'modal-40',
  xlg: 'modal-80',
};

class Modal extends React.Component {
  componentDidMount() {
    document.addEventListener('mousedown', this.close);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.close);
  }

  close = (e) => {
    if (this.modalDialogRef && !this.modalDialogRef.contains(e.target)) {
      this.props.close();
    }
  };

  render() {
    if (this.props.isOpen === false) return null;
    const hasHeader = !!this.props.title;
    return (
      <div
        id={this.props.id}
        tabIndex="-1"
        className="modal fade show d-block"
      >
        <div
          className={`modal-dialog ${sizeClasses[this.props.size]}`}
          role="document"
          ref={(ref) => this.modalDialogRef = ref}
        >
          <div className="modal-content">
            <div className={clsx('modal-header d-flex align-items-center p-0', { 'modal-title': hasHeader })}>
              <h6 className="ml-3 mb-0">
                {this.props.title}
              </h6>
              <div className="ml-auto mr-2 pointer">
                <i id="modalCloseButton" className="fa fa-times" onClick={this.props.close} />
              </div>
            </div>
            <div className="modal-body">
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Modal.propTypes = {
  id: PropTypes.string,
  isOpen: PropTypes.bool,
  close: PropTypes.func.isRequired,
  children: PropTypes.element,
  title: PropTypes.string,
  size: PropTypes.string,
};

Modal.defaultProps = {
  size: 'lg',
};

export default Modal;
