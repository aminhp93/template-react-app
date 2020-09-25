import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

import { makeFullUrl } from 'utils/url';
import ProfileSessions from './ProfileSessions';
import ProfileProjectTab from './ProfileProjectTab';
import ProfileSkill from './ProfileSkill';

interface IProps {
    selectedProfile: any,
}

class ProfileOverviewTab extends React.Component<IProps> {

    render() {
        const { selectedProfile } = this.props;
        const { linkedin } = selectedProfile
        return (
            <>
                <ProfileSessions />
                <ProfileSkill />
                <div className="profile--block">
                    <h6>PROJECTS</h6>
                    <div id="projects" className="card text-left">
                        <ProfileProjectTab />
                    </div>
                </div>

                <div className="profile--block">
                    <h6>LINKEDIN PROFILE</h6>
                    <div id="profilePageLinkedin" className="card">
                    {linkedin ? (
                        <a href={makeFullUrl(linkedin)} target="_blank" rel="noreferrer" className="text-link">
                        {makeFullUrl(linkedin)}
                        </a>
                    ) : (
                        'Not found'
                    )}
                    </div>
                </div>
            </>
        )
    }
}

const mapStateToProps = (state) => {
    return {
      selectedProfile: get(state, 'selectedProfile') || {}
    };
};

export default connect(mapStateToProps, null)(ProfileOverviewTab);
