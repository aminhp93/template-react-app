import { ModalAction } from 'constants/action';

export const INITIAL_STATE = {
  initialModal: false, // when this field is true the ModalContainer will be render
  displayModal: null,
  disableOtherModals: false,
  modalData: {},
  onModalClose: null,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ModalAction.SHOW_MODAL: {
      return {
        ...action.payload,
        initialModal: true,
        disableOtherModals: false,
      };
    }

    case ModalAction.UPDATE_ENTITY: {
      return {
        ...state,
        modalData: {
          ...state.modalData,
          ...action.payload,
        },
      };
    }

    default:
      break;
  }
  return state;
};
