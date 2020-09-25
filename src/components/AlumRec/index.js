import * as React from 'react';
import clsx from 'clsx';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import Dialog from 'components/Dialog';
import UserInfo from 'utils/userInfo';
import ProgramService from 'services/Program';
import RecommendationService from 'services/Recommendation';
import RecommendationForm from './RecommendationForm';
import RecommendationsList from './RecommendationsList';

import GROUP_8_ICON_URL from '@img/group-8.svg';
import STAR_CALLOUT_ICON_URL from '@img/star_callout.svg';


const logger = new Logger('AlumRec');

class AlumRec extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabs: [{
        id: 1,
        title: 'FORM',
        render: this.renderFormTab,
      }, {
        id: 2,
        title: UserInfo.isStaff() ? 'RECOMMENDATIONS' : 'MY RECOMMENDATIONS',
        render: this.renderMyRecommendationsTab,
      }],
      currentTab: 1,
      programs: [],
      recommendations: [],
      fetching: true,
      dialog: null,
      recData: {},
      deleteRecId: null,
      recommendationSheetUrl: '',
      page: 1,
      end: false,
    };
  }

  componentDidMount() {
    this.fetchPrograms();
    window.addEventListener('scroll', this.checkScrollFetchMore);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.checkScrollFetchMore);
  }

  fetchPrograms = async () => {
    this.setState({ fetching: true });
    let programs = [];
    let recommendationSheetUrl = '';
    await ProgramService.getPrograms()
      .then((res) => {
        programs = res.data && res.data.results;
      })
      .catch((errors) => logger.error(errors));
    await RecommendationService.getRecommendationsSheet()
      .then((res) => {
        recommendationSheetUrl = res.data && res.data.results;
      })
      .catch((error) => logger.error(error));
    this.setState({
      programs,
      recommendationSheetUrl,
      fetching: false,
    });
  };

  fetchRecommendations = () => {
    this.setState({ fetching: true });
    RecommendationService.getRecommendations({ page: this.state.page })
      .then((res) => {
        if (res.data) {
          this.setState({
            recommendations: [...this.state.recommendations, ...res.data.results],
            fetching: false,
            end: res.data.next === null,
          });
        }
      })
      .catch((errors) => {
        this.setState({
          fetching: false,
        });
        logger.error(errors);
      });
  }

  fetchMore() {
    if (this.state.recommendations.length > 0 && !this.state.fetching && !this.state.end) {
      this.setState({
        page: this.state.page + 1,
      }, () => this.fetchRecommendations());
    }
  }

  fetchFirstPage() {
    if (this.state.fetching) return;
    this.setState({
      recommendations: [],
      page: 1,
    }, () => this.fetchRecommendations());
  }

  checkScrollFetchMore = () => {
    if (window.innerHeight + window.scrollY
        > document.getElementsByClassName('main-page')[0].clientHeight - 200) {
      this.fetchMore();
    }
  }

  handleSubmit = (recData) => {
    this.setState({ recData, dialog: 'confirm' });
  };

  handleSubmitDismiss = () => {
    this.setState({ recData: null, dialog: null });
  };

  handleSubmitConfirm = () => {
    this.setState({ fetching: true });
    RecommendationService.createRecommendation(this.state.recData)
      .then((res) => {
        if (res.data) {
          this.setState({ currentTab: 2, fetching: false, dialog: null }, () => {
            this.fetchFirstPage();
          });
        }
      }).catch((errors) => {
        logger.error(errors);
        this.setState({ fetching: false, dialog: null });
      });
  };

  handleDeleteRecommendationSubmit = (id) => {
    this.setState({ deleteRecId: id, dialog: 'delete' });
  };

  deleteRecommendation = () => {
    const { deleteRecId } = this.state;
    this.setState({ fetching: true });
    RecommendationService.deleteRecommendation(deleteRecId)
      .then(() => {
          this.setState({ deleteRecId: null, fetching: false, dialog: null }, () => {
            this.fetchFirstPage();
          });
      })
      .catch((errors) => {
        logger.error(errors);
        this.setState({ fetching: false, dialog: null });
      });
  };

  changeTab = (currentTab) => {
    this.setState({ currentTab }, () => {
      if (currentTab === 2 && Object.keys(this.state.recommendations).length === 0) {
        this.fetchFirstPage();
      }
    });
  };

  renderFormTab = () => (
    <RecommendationForm
      programs={this.state.programs}
      fetching={this.state.fetching}
      currentUser={UserInfo.getUserInfo()}
      onSubmit={(data) => this.handleSubmit(data)}
    />
  );

  renderMyRecommendationsTab = () => (
    <RecommendationsList
      recommendations={this.state.recommendations}
      onDelete={(id) => this.handleDeleteRecommendationSubmit(id)}
    />
  );

  renderTabs = () => {
    const { tabs, currentTab, recommendationSheetUrl } = this.state;
    return (
      <div>
        <div className="nav-container">
          <ul className="nav nav-tabs">
            {
              tabs.map((tab) => (
                <li className="nav-item" key={tab.id}>
                  <a
                    id={tab.title && `${tab.title.toLowerCase()}TabLink`}
                    className={clsx('nav-link', { active: currentTab === tab.id })}
                    onClick={() => this.changeTab(tab.id)}
                  >
                    <b>{tab.title}</b>
                  </a>
                </li>
              ))
            }
          </ul>
          {
            UserInfo.isStaff()
              ? (
                <div className="recommendation-sheet">
                  <a href={`https://docs.google.com/spreadsheets/d/${recommendationSheetUrl}/edit#gid=0`} target="_blank" rel="noreferrer">
                    Access recommendation sheet
                    <img src={GROUP_8_ICON_URL} alt="" />
                  </a>
                </div>
              )
              : null
          }
        </div>
        <hr className="mt-0" />
        <div className="tab-content pb-4">
          {tabs.filter((tab) => tab.id === currentTab)[0].render()}
        </div>
      </div>
    );
  };

  render() {
    const { dialog, fetching } = this.state;
    return (
      <>
        <h1 className="page-title">
          Recommend a Future Insight Fellow
          <img src={STAR_CALLOUT_ICON_URL} alt="" className="star" />
        </h1>
        {this.renderTabs()}
        <Dialog
          isOpen={dialog === 'confirm'}
          name="recommendation-submit-confirm"
          onDismiss={this.handleSubmitDismiss}
          onConfirm={this.handleSubmitConfirm}
          text="You will not be able to change the information in this form after submission. Are you sure you want to continue?"
          loading={fetching}
        />
        <Dialog
          isOpen={dialog === 'delete'}
          name="recommendation-delete-confirm"
          onDismiss={this.handleSubmitDismiss}
          onConfirm={this.deleteRecommendation}
          text="This recommendation will be deleted permanently. Are you sure you want to continue?"
          loading={fetching}
        />
      </>
    );
  }
}

export default AlumRec;
