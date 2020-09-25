import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'components/Modal';

const ConfirmCancel = (props) => (
  <Modal isOpen={props.isOpen} close={props.close} title={props.title} size="sm">
    <div id="confirmCancelModal">
      <div className="mb-3 text-left ml-1 mb-2">
        Are you sure you want to cancel?
      </div>
      <div className="text-right mt-3 mb-2">
        <button
          id="confirmCancelButton"
          className="btn btn-danger btn-lg mr-3"
          type="button"
          onClick={props.confirm}
          disabled={props.loading}
        >
          Cancel
          {' '}
          {props.target}
        </button>
        <button
          id="confirmCancelBackButton"
          className="btn btn-light btn-lg"
          onClick={props.close}
          type="button"
        >
          Back
        </button>
      </div>
    </div>
  </Modal>
);

ConfirmCancel.propTypes = {
  title: PropTypes.string,
  isOpen: PropTypes.bool,
  target: PropTypes.string,
  close: PropTypes.func.isRequired,
  confirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default ConfirmCancel;
