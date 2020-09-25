import { ModalAction } from 'constants/action';

export const showModal = (displayModal, options) => (
  {
    type: ModalAction.SHOW_MODAL,
    payload: { displayModal, ...options },
  }
);

export const updateEntity = (entity) => (
  {
    type: ModalAction.UPDATE_ENTITY,
    payload: { entity },
  }
);

export default {};
