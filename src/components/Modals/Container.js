import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { showModal } from 'actions/modal';
import { ModalKey } from 'constants/common';

import CreateProject from './CreateProject';
import ImageViewer from './ImageViewer';
import AgreementForm from './AgreementForm';


class ModalContainer extends Component {
  handleModalClose = () => {
    this.props.showModal(null);
    const body = document.getElementsByTagName('body')[0];
    if (body) body.classList.remove('modal-open');
  };

  render() {
    const { displayModal, onModalClose, ...rest } = this.props;
    const modalProps = {
      ...rest,
      onModalClose: (e) => {
        this.handleModalClose();
        if (onModalClose) {
          onModalClose(e);
        }
      },
    };
    if (displayModal) {
      const body = document.getElementsByTagName('body')[0];
      if (body) body.classList.add('modal-open');
    }

    switch (displayModal) {
      case ModalKey.CREATE_PROJECT:
        return <CreateProject {...modalProps} />;
      case ModalKey.IMAGE_VIEWER:
        return <ImageViewer {...modalProps} />;
      case ModalKey.AGREEMENT_FORM:
        return <AgreementForm {...modalProps} />;
      default:
        return null;
    }
  }
}

ModalContainer.propTypes = {
  displayModal: PropTypes.string,
  modalData: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.func,
  ]),
  onModalClose: PropTypes.func,
  showModal: PropTypes.func,
};

const mapStateToProps = ({ modal }) => ({
  ...modal,
});

const mapDispatchToProps = {
  showModal,
};

export default connect(mapStateToProps, mapDispatchToProps)(ModalContainer);
