import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

import ProfileService from 'services/Profile';
import LoadingIndicator from 'components/LoadingIndicator';

interface IProps {
    selectedProfile: any,
    authUser: any,
}

interface IState {
    userSessions: any,
    loading: boolean,
}

class ProfileSessions extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      userSessions: [],
      loading: false,
    };
  }

    componentDidMount() {
        this.setState({ loading: true });
        const { selectedProfile, authUser } = this.props;
        const id = selectedProfile ? selectedProfile.id : authUser.id
        ProfileService.getSessions(id).then((res) => {
        if (res && res.data && res.data.length > 0) {
            this.setState({
            userSessions: res.data,
            loading: false,
            });
        } else {
            this.setState({ loading: false });
        }
        }).catch((e) => {
            this.setState({ loading: false });
        });  
    }

  makeSessionTitle = (session) => `${session.name} . ${session.program.name} . ${session.location.address}`;

  checkLoading = () => {
    if (this.state.loading) return <LoadingIndicator />;
    return 'No session';
  };

  render() {
    const { userSessions } = this.state;
    return (
      <div className="profile--block">
        <h6>INSIGHT SESSION</h6>
        <div id="profilePageSession" className="card text-left">
          <span className="mx-auto">
            {(userSessions && userSessions.length > 0 && !this.state.loading)
              ? userSessions.map((session, index) => (
                <div key={session.id} className="my-2">
                  <span className="mr-4 text-lg">
                    SESSION
                    {index + 1}
                  </span>
                  <span>{this.makeSessionTitle(session)}</span>
                </div>
              ))
              : this.checkLoading()}
          </span>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
    return {
      selectedProfile: get(state, 'selectedProfile'),
      authUser: get(state, 'authUser') || {}
    };
};
  
export default connect(mapStateToProps, null)(ProfileSessions);
