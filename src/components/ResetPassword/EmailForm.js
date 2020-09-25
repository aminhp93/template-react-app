import * as React from 'react';
import * as PropTypes from 'prop-types';
import LoadingIndicator from 'components/LoadingIndicator';
import { isEmail } from 'utils/validator';


class EmailForm extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
    action: PropTypes.func.isRequired,
  };

  state = {
    email: '',
  };

  onEmailChanged = (e) => {
    let email = e.target.value;
    if (!isEmail(email)) {
      email = '';
    }
    this.setState({ email });
  };

  render() {
    const { action, loading } = this.props;
    const { email } = this.state;
    return (
      <form onSubmit={action} method="POST">
        <div className="text-center mb-4">
          <span>
            Please enter your registered email address to request a password reset.
            You might need to check your spam folder.
          </span>
        </div>
        <div className="text-left mb-4">
          <label htmlFor="email" className="font-weight-bold">Email</label>
          <input
            type="text"
            className="form-control"
            name="email"
            id="email"
            placeholder="johndoe@example.com"
            onChange={(e) => this.onEmailChanged(e)}
          />
        </div>
        {loading ? <LoadingIndicator /> : (
          <button
            id="loginButton"
            className="btn btn-primary btn-lg px-4 mt-2 text-uppercase"
            disabled={!email}
          >
            CONTINUE
          </button>
        )}
      </form>
    );
  }
}

export default EmailForm;
