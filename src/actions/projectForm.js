import { ProjectFormAction } from 'constants/action';

export const changeInput = (field, value) => ({
  type: ProjectFormAction.CHANGE_INPUT,
  payload: {
    field,
    value,
  },
});

export const resetForm = () => ({
  type: ProjectFormAction.RESET_FORM,
});

export const initFormData = (data) => ({
  type: ProjectFormAction.INIT_FORM_DATA,
  payload: data,
});
