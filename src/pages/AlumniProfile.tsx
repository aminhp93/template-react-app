import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { fetchSelectedProfile } from 'reducers/selectedProfile';
import ProfileInfo from 'components/ProfileInfo';

interface IProps {
    match: any,
    selectedProfile: any,
    fetchSelectedProfile: any,
    history: any,
}

class AlumniProfile extends React.Component<IProps> {

  async componentDidMount() {
    const id = this.props.match.params.id;
    const res = await this.props.fetchSelectedProfile(id)
    if (!res) {
      this.props.history.push('/profile/')
    }
  }

  render() {
    if (!this.props.selectedProfile) return null
    return (
      <div className="main-page">
        <ProfileInfo />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
    return {
        selectedProfile: get(state, 'selectedProfile'),
    };
};

const mapDispatchToProps = {
    fetchSelectedProfile
};

export default  compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(AlumniProfile)
