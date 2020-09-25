import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'components/Modal';

const Delete = (props) => (
  <Modal isOpen={props.isOpen} close={props.close}>
    <div id="confirmDeleteModal">
      <div className="mb-3 text-left">
        You are going to permanently delete this
        {' '}
        {props.targetType}
        {' '}
        and you can’t undo this action.
      </div>
      <div className="text-right mt-3 mb-4">
        <button
          id="deleteModalcancelButton"
          className="btn btn-light btn-lg mr-2"
          onClick={props.close}
          type="button"
        >
          CANCEL
        </button>
        <button
          id="deleteModalconfirmButton"
          className="btn btn-danger btn-lg"
          type="button"
          onClick={props.delete}
          disabled={props.deleting}
        >
          DELETE
        </button>
      </div>
    </div>
  </Modal>
);

Delete.propTypes = {
  isOpen: PropTypes.bool,
  close: PropTypes.func.isRequired,
  targetType: PropTypes.string.isRequired,
  delete: PropTypes.func.isRequired,
  deleting: PropTypes.bool,
};

export default Delete;
