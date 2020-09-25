import * as React from 'react';
import * as PropTypes from 'prop-types';
import InputErrorMessage from 'components/InputErrorMessage';
import Checkbox, { computeState } from 'components/Checkbox';
import { isEmail } from 'utils/validator';

class RecommendationForm extends React.Component {
  static propTypes = {
    programs: PropTypes.arrayOf(PropTypes.object),
    currentUser: PropTypes.objectOf(PropTypes.any),
    recommendation: PropTypes.objectOf(PropTypes.any),
    onSubmit: PropTypes.func,
    fetching: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      errors: {},
      loading: false,
      recommendation: { ...this.getInitialRecommendation() },
    };
  }

  getInitialRecommendation = () => {
    const { recommendation, currentUser } = this.props;
    if (recommendation) {
      return recommendation;
    }
    return {
      referrer_full_name: `${currentUser.first_name} ${currentUser.last_name}`,
      referrer_email: `${currentUser.email}`,
      programs: [],
    };
  };

  handleChange = (key, value) => {
    const recommendation = { ...this.state.recommendation };
    recommendation[key] = value;
    this.setState({ recommendation });
  };

  handleInputChange = (event) => {
    event.preventDefault();
    this.handleChange(event.target.name, event.target.value);
  };

  handleProgramsChanged = (id) => {
    const recommendation = { ...this.state.recommendation };
    let { programs } = recommendation;
    if (programs.includes(id)) {
      programs = programs.filter((p) => p !== id);
    } else {
      programs.push(id);
    }
    recommendation.programs = programs;
    this.setState({ recommendation });
  };

  handleSubmitClicked = (event) => {
    event.preventDefault();
    if (this.validate()) {
      this.props.onSubmit(this.state.recommendation);
    }
  };


  validate = () => {
    const recommendation = { ...this.state.recommendation };
    const errors = {};
    if (recommendation.referrer_full_name === '') {
      errors.referrer_full_name = 'Please provide your name.';
    }
    if (recommendation.referrer_email && !isEmail(recommendation.referrer_email)) {
      errors.referrer_email = 'Please provide a valid email.';
    }
    if (!recommendation.referree_first_name) {
      errors.referree_first_name = 'Please provide the referral\'s first name.';
    }
    if (!recommendation.referree_last_name) {
      errors.referree_last_name = 'Please provide the referral\'s last name.';
    }
    if (!recommendation.referree_email) {
      errors.referree_email = 'Please provide the referral\'s email.';
    } else if (!isEmail(recommendation.referree_email)) {
      errors.referree_email = 'Please provide a valid email.';
    }
    if (!recommendation.programs || Object.keys(recommendation.programs).length === 0) {
      errors.programs = 'Please select at least one program.';
    }
    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  render() {
    const { errors, loading, recommendation } = this.state;
    const { fetching } = this.props;
    // Exclude Data Product Management program from program option list
    const programs = this.props.programs.filter((p) => p.is_available);
    return (
      <div className="form recommendation" name="recommendation-form">
        <div className="form-group">
          <p>{'Thank you for your recommendation. For each person you\'d like to refer, please provide the following information:'}</p>
        </div>
        <div className="form-group">
          <label className="form-control-label">
            <b>Referral First Name</b>
          </label>
          <input
            type="text"
            name="referree_first_name"
            className="form-control"
            placeholder="Their first name"
            onChange={this.handleInputChange}
            required
          />
          {errors.referree_first_name && <InputErrorMessage>{errors.referree_first_name}</InputErrorMessage>}
        </div>
        <div className="form-group">
          <label className="form-control-label">
            <b>Referral Last Name</b>
          </label>
          <input
            type="text"
            name="referree_last_name"
            className="form-control"
            placeholder="Their last name"
            onChange={this.handleInputChange}
            required
          />
          {errors.referree_last_name && <InputErrorMessage>{errors.referree_last_name}</InputErrorMessage>}
        </div>
        <div className="form-group">
          <label className="form-control-label">
            <b>Referral Email</b>
          </label>
          <input
            type="text"
            name="referree_email"
            className="form-control"
            placeholder="Their email"
            onChange={this.handleInputChange}
            required
          />
          {errors.referree_email && <InputErrorMessage>{errors.referree_email}</InputErrorMessage>}
        </div>
        <div className="form-group">
          <label className="form-control-label">
            <b>Which program do you think is the best fit for?</b>
          </label>
          <ul>
            {programs.map((p) => (
              <li key={p.abbr}>
                <Checkbox
                  label={`Insight ${p.name}`}
                  state={computeState(recommendation.programs.includes(p.id))}
                  onChange={() => this.handleProgramsChanged(p.id)}
                />
              </li>
            ))}
          </ul>
          {errors.programs && <InputErrorMessage>{errors.programs}</InputErrorMessage>}
        </div>
        <div className="form-group">
          <label className="form-control-label">
            <b>Why do you think they would make a great Insight Fellow? (2-3 sentences)</b>
          </label>
          <textarea
            className="form-control mt-2"
            onChange={this.handleInputChange}
            name="note"
          />
        </div>
        <div className="form-group">
          <button
            className="btn btn-primary"
            type="button"
            disabled={loading || fetching}
            onClick={(e) => this.handleSubmitClicked(e)}
          >
            SUBMIT
          </button>
        </div>
      </div>
    );
  }
}

export default RecommendationForm;
