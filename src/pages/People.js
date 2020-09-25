import React from 'react';
import { CSSTransition } from 'react-transition-group';
import userInfo, { getUserNameDisplay, getPositionDisplay, getCurrentPositions } from 'utils/userInfo';
import PageHero from 'components/PageHero';
import Alumni from 'components/Alumni';
import { OnBoardingStep, DEFAULT_PROFILE_IMAGE_URL } from 'constants/common';
import makePageTitle from 'utils/common';
import SessionBadge from 'components/SessionBadge';


class Dashboard extends React.Component {
  state = {
    welcomeStart: false,
    welcomeEnd: false,
  };

  componentDidMount() {
    document.title = makePageTitle('People Directory');
    setTimeout(() => this.setState({ welcomeStart: true }), 1000);
    setTimeout(() => this.setState({ welcomeEnd: true }), 3200);
  }

  render() {
    const user = userInfo.getUserInfo() || {};
    const canSeeDirectory = user.is_approved === true
      && user.onboarding_step === OnBoardingStep.COMPLETE;
    const description = 'Join our network and connect to Insight alumni\nacross the industry.';
    const welcome = (
      <div className="row">
        <div className="col-12">
          <h1 className="text-center page-title">Welcome to Insight</h1>
        </div>
      </div>
    );

    const position = getCurrentPositions(user)[0];

    const afterWelcome = (
      <PageHero>
        <div className="row">
          <div className="col-sm-6 welcome-fellow-profile">
            <img
              className="profile--image position-absolute"
              src={(user.profile && user.profile.profile_image) || DEFAULT_PROFILE_IMAGE_URL}
              width="120px"
              alt="Alumni"
            />
            <div style={{ margin: '0.5rem 0 0 9.5rem' }}>
              <h4 className="mb-2">{getUserNameDisplay(user)}</h4>
              <h6 className="page-description mb-2" style={{ whiteSpace: 'pre-wrap' }}>
                {position && position.position}<br />
                {position && `@ ${position.employer}`}
              </h6>
              <SessionBadge creator={user} />
            </div>
          </div>
          <div className="col-sm-6" style={{ paddingLeft: '5rem' }}>
            <h2 className="page-title mb-2 mt-1">Fellow Directory</h2>
            <h6 className="page-description" style={{ whiteSpace: 'pre-wrap' }}>{description}</h6>
          </div>
        </div>
      </PageHero>
    );
    return (
      <div className="page-content">
        {!this.state.welcomeEnd
          && (
          <PageHero>
            <CSSTransition
              in={this.state.welcomeStart}
              timeout={2000}
              classNames="fade-slow"
              unmountOnExit
            >
              {welcome}
            </CSSTransition>
          </PageHero>
          )}
        <CSSTransition
          in={this.state.welcomeEnd}
          timeout={2000}
          classNames="fade-slow"
          unmountOnExit
        >
          {afterWelcome}
        </CSSTransition>
        {canSeeDirectory && <Alumni />}
      </div>
    );
  }
}

export default Dashboard;
