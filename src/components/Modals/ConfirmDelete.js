import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'components/Modal';

class ConfirmDelete extends React.Component {
  constructor(props) {
    super(props);
    this.confirmText = `DELETE THIS ${props.targetType.toUpperCase()}`;
    this.state = {
      confirmInput: '',
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    const { targetType, targetName } = this.props;
    return (
      <Modal isOpen={this.props.isOpen} close={this.props.close}>
        <div id="confirmDeleteModal">
          <div className="mb-3 text-left">
            {targetName && (
            <div className="mb-2">
              <b>
                DELETE:
                {targetName}
                ?
              </b>
            </div>
            )}
            You are going to permanently delete a
            {' '}
            {targetType}
            {' '}
            and you can’t undo this action.
            Please type “
            <span className="text-danger">{this.confirmText}</span>
            “ to continue.
          </div>
          <input
            type="text"
            className="form-control"
            name="confirmInput"
            onChange={this.handleChange}
          />
          <div className="text-right mt-3 mb-4">
            <button
              id="deleteModalcancelButton"
              className="btn btn-light btn-lg mr-2"
              onClick={this.props.close}
              type="button"
            >
              CANCEL
            </button>
            <button
              id="deleteModalconfirmButton"
              className="btn btn-danger btn-lg"
              type="button"
              disabled={this.state.confirmInput !== this.confirmText}
              onClick={this.props.delete}
            >
              DELETE
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}

ConfirmDelete.propTypes = {
  isOpen: PropTypes.bool,
  close: PropTypes.func.isRequired,
  targetType: PropTypes.string.isRequired,
  targetName: PropTypes.string,
  delete: PropTypes.func.isRequired,
};

export default ConfirmDelete;
