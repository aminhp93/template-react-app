import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { isEmail } from 'utils/validator';
import { FAQ_LINK } from 'constants/common';
import LoadingIndicator from 'components/LoadingIndicator';


class LoginForm extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
    action: PropTypes.func.isRequired,
  };

  state = {
    email: '',
    password: '',
  };

  onEmailChanged = (e) => {
    let email = e.target.value;
    if (email) {
      email = email.trim().toLowerCase();
    }
    if (isEmail(email)) {
      this.setState({ email });
    }
  };

  onPasswordChanged = (e) => {
    const password = e.target.value.trim();
    if (password.length >= 8) {
      this.setState({ password });
    }
  };

  render() {
    const { loading, action } = this.props;
    const { email, password } = this.state;
    return (
      <form onSubmit={action} method="POST">
        <div className="text-left mb-4">
          <label htmlFor="username" className="font-weight-bold">Email</label>
          <input
            type="text"
            className="form-control"
            name="username"
            id="username"
            onChange={(e) => this.onEmailChanged(e)}
          />
        </div>
        <div className="text-left mb-4">
          <label htmlFor="password" className="font-weight-bold">Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            id="password"
            onChange={(e) => this.onPasswordChanged(e)}
          />
        </div>
        <div className="text-right mb-4">
          <Link to="/reset-password">Forgot your password?</Link>
        </div>
        {loading ? <LoadingIndicator /> : (
          <button
            id="loginButton"
            className="btn btn-primary btn-lg px-4 mt-2 text-uppercase"
            disabled={!email || !password}
          >
            LOGIN
          </button>
        )}
        <div className="text-center mt-4">
          <a href={FAQ_LINK} target="_blank" rel="noreferrer">Having issue?</a>
        </div>
      </form>
    );
  }
}

export default LoginForm;
