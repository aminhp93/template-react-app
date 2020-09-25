import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Modal from 'components/Modal';

const Discard = (props) => (
  <Modal isOpen={props.isOpen} close={props.close} title={props.title ? props.title : 'Discard draft'} size="sm">
    <div id="discardModal">
      <div className="mb-3 text-left ml-1 mb-2">
        {
          props.text ? props.text
            : `You haven't finished your ${props.target} yet. Are you sure you want to leave and discard your draft?`
        }
      </div>
      <div className="text-right mt-3 mb-2">
        <button
          id="discardModalDiscardButton"
          className={clsx('btn btn-lg mr-3', props.okClassName || 'btn-outline-light')}
          type="button"
          onClick={props.confirm}
        >
          {props.okText || 'Discard'}
        </button>
        <button
          id="discardModalBackButton"
          className={clsx('btn btn-lg', props.cancelClassName || 'btn-primary')}
          onClick={props.close}
          type="button"
        >
          {props.cancelText || 'Back'}
        </button>
      </div>
    </div>
  </Modal>
);

Discard.propTypes = {
  close: PropTypes.func.isRequired,
  confirm: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  target: PropTypes.string,
  title: PropTypes.string,
  text: PropTypes.string,
  okClassName: PropTypes.string,
  cancelClassName: PropTypes.string,
  okText: PropTypes.string,
  cancelText: PropTypes.string,
};

export default Discard;
