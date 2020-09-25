import { ProjectFormAction } from 'constants/action';

export const INITIAL_STATE = {
  tags: [],
  dataset: {
    link: '',
    description: '',
    name: '',
  },
  title: '',
  tag_line: '',
  description: '',
  solution: '',
  thumbnail_image: null,
  demo_url: '',
  slide_url: '',
  codebase_url: '',
  error: {},
  technologies: [],
  session_id: 0,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ProjectFormAction.CHANGE_INPUT: {
      const newState = { ...state };
      newState[action.payload.field] = action.payload.value;
      return newState;
    }

    case ProjectFormAction.INIT_FORM_DATA: {
      // eslint-disable-next-line
      const necessaryFields = Object.keys(INITIAL_STATE).concat(['slug', 'id']).reduce((o, k) => { o[k] = action.payload[k]; return o; }, {});

      const newState = {
        ...state,
        ...necessaryFields,
        dataset: necessaryFields.dataset || INITIAL_STATE.dataset,
      };
      const tags = [];

      action.payload.tags.forEach((tag) => {
        tags.push(tag.name);
      });
      newState.tags = tags;

      return newState;
    }

    case ProjectFormAction.RESET_FORM: {
      return {
        ...INITIAL_STATE,
      };
    }

    default:
      break;
  }
  return state;
};
