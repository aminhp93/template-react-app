import * as React from 'react';
import * as PropTypes from 'prop-types';
import userInfo from 'utils/userInfo';
import LoadingIndicator from 'components/LoadingIndicator';
import ProfileService from "services/Profile";


class ProfileSetupForm extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
    action: PropTypes.func.isRequired,
  };

  state = {
    // eslint-disable-next-line
    given_name: userInfo.getUserInfo() && userInfo.getUserInfo().first_name,
    // eslint-disable-next-line
    family_name: userInfo.getUserInfo() && userInfo.getUserInfo().last_name,
    // eslint-disable-next-line
    linkedin: userInfo.getUserInfo() && userInfo.getUserInfo().linkedin,
  };

  componentDidMount() {
    this.fetchInviteInfo();
  }

  onTextChanged = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  fetchInviteInfo() {
    const { given_name, family_name, linkedin } = this.state;
    ProfileService.getInviteInfo().then((res) => {
      if(!given_name) {
        this.setState({ given_name: res.data.first_name })
      }
      if(!family_name) {
        this.setState({ family_name: res.data.last_name })
      }
      if(!linkedin) {
        this.setState({ linkedin: res.data.linkedin })
      }
    })
  }

  render() {
    const { loading, action } = this.props;
    // eslint-disable-next-line
    const { given_name, family_name, linkedin } = this.state;
    return (
      <form onSubmit={action} method="POST">
        <div className="text-left mb-4">
          <label htmlFor="first_name" className="font-weight-bold">First name</label>
          <input
            type="text"
            className="form-control"
            name="given_name"
            id="given_name"
            placeholder="John"
            // eslint-disable-next-line
            value={given_name || ''}
            onChange={this.onTextChanged}
          />
        </div>
        <div className="text-left mb-4">
          <label htmlFor="last_name" className="font-weight-bold">Last name</label>
          <input
            type="text"
            className="form-control"
            name="family_name"
            id="family_name"
            placeholder="Doe"
            // eslint-disable-next-line
            value={family_name || ''}
            onChange={this.onTextChanged}
          />
        </div>
        <div className="text-left mb-4">
          <label htmlFor="linkedin" className="font-weight-bold">LinkedIn URL</label>
          <input
            type="text"
            className="form-control"
            name="linkedin"
            id="linkedin"
            value={linkedin || ''}
            placeholder="https://www.linkedin.com/in/johndoe"
            onChange={this.onTextChanged}
          />
        </div>
        {loading ? <LoadingIndicator /> : (
          <button
            id="loginButton"
            className="btn btn-primary btn-lg px-4 mt-2 text-uppercase"
            // eslint-disable-next-line
            disabled={!given_name || !family_name || !linkedin}
          >
            CONFIRM
          </button>
        )}
      </form>
    );
  }
}

export default ProfileSetupForm;
