import React from 'react';
import userInfo from 'utils/userInfo';
import Projects from 'components/Projects';
import makePageTitle from 'utils/common';

class Project extends React.Component {
  componentDidMount = () => {
    document.title = makePageTitle('Project Directory');
  };

  render() {
    const user = userInfo.getUserInfo() || {};
    const canSeeDirectory = user.is_approved === true;
    return (
      <div className="main-page">
        <div className="page-content">
          {canSeeDirectory && <Projects />}
        </div>
      </div>
    );
  }
}

export default Project;
