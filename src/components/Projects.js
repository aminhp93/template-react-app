import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { showModal } from 'actions/modal';
import { ModalKey } from 'constants/common';
import history from 'utils/history';
import emitter, { EVENT_KEYS } from 'utils/event';
import UserInfo from 'utils/userInfo';
import QueryString from 'utils/queryString';
import FilterService from 'services/Filter';
import ProjectService from 'services/Project';
import ProfileService from 'services/Profile';
import ProjectList from 'components/ProjectList';
import TagList from 'components/SearchFilter/TagList';
import SearchBox from 'components/SearchFilter/SearchBox';
import LoadingIndicator from 'components/LoadingIndicator';
import ProjectSessionFilter from 'components/ProjectSessionFilter';

class Projects extends React.Component {
  constructor(props) {
    super(props);
    const { search } = history.location;
    this.currentParams = search ? QueryString.parse(search) : {};
    this.state = {
      projects: [],
      totalResults: null,
      fetching: false,
      page: 1,
      end: false,
      tagList: QueryString.initTagList(this.currentParams),
      mySessionFilter: false,
      userSessions: [],
      sessionFilter: this.currentParams.keyword || '',
      activeSessions: [],
    };
    this.fetchProjects = this.fetchProjects.bind(this);
    this.fetchMore = this.fetchMore.bind(this);
    this.fetchActiveSessions = this.fetchActiveSessions.bind(this);
  }

  componentDidMount() {
    this.fetchActiveSessions();
    this.fetchProjects();
    this.fetchUserSessions();
    window.addEventListener('scroll', this.checkScrollFetchMore);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.checkScrollFetchMore);
    this.handleProjectsSuccessResponse = () => {};
    this.handleProjectsErrorResponse = () => {};
  }

  setTagList(tagList) {
    this.setState({ tagList }, () => this.fetchProjects(tagList));
  }

  fetchUserSessions() {
    ProfileService.getSessions(UserInfo.getUserId()).then((res) => {
      if (res && res.data && res.data.length > 0) {
        this.setState({ userSessions: res.data });
      }
    });
  }

  fetchActiveSessions() {
    const params = { active: true };
    FilterService.getFilterValues('sessions', params).then((res) => {
      if (res && res.data) {
        this.setState({
          activeSessions: res.data.map((session) => ({
            id: session.id,
            title: `${session.name}.${session.program.abbr}.${session.location.abbr}`,
            value: `${session.name}.${session.program.abbr}.${session.location.abbr}`,
          })),
        });
      }
    });
  }

  fetchProjects(tagList) {
    // If tagList is passed as an argument, it means that the query params is updated
    // and we should request the first page
    const params = {
      page: tagList ? 1 : this.state.page,
    };
    let extraParams = {};
    if (tagList) {
      // The list can contain many types of keywords so that we can add more filter types later on.
      this.setState({ page: 1, projects: [] });
      if (tagList.length > 0) {
        tagList.forEach((tag) => {
          if (extraParams[tag.type]) {
            extraParams[tag.type].push(tag.value);
          } else {
            extraParams[tag.type] = [tag.value];
          }
        });
      }
      this.currentParams = extraParams;
    } else {
      extraParams = this.currentParams;
    }
    // Update urls for sharing purposes
    QueryString.updateUrlWithParams(extraParams);
    // Update current tag list to check if the response is the lastest one later
    this.currentTagList = tagList;
    this.setState({ fetching: true });
    ProjectService.getProjects({ ...params, ...extraParams }, tagList)
      .then(this.handleProjectsSuccessResponse)
      .catch(this.handleProjectsErrorResponse);
  }

  handleProjectsSuccessResponse = (res) => {
    const isLastRequest = res && this.currentTagList === res.tagList;
    if (res && res.data && res.data.results && isLastRequest) {
      this.setState({
        projects: res.tagList ? res.data.results : [...this.state.projects, ...res.data.results],
        totalResults: res.data.count,
        end: res.data.next === null,
        fetching: false,
      });
    }
  };

  handleProjectsErrorResponse = () => {
    this.setState({ fetching: false, end: true });
  };

  fetchMore() {
    if (!this.state.fetching && !this.state.end) {
      this.setState({
        page: this.state.page + 1,
      }, () => this.fetchProjects());
    }
  }

  checkScrollFetchMore = () => {
    // Fetch new content when users nearly approach the end of the page.
    if (window.innerHeight + window.scrollY
        > document.getElementsByClassName('main-page')[0].clientHeight - 200) {
      this.fetchMore();
    }
  };

  handleAddTag = (item) => {
    const tagList = [...this.state.tagList];
    const existedKeywords = tagList.map((tag) => tag.title);
    // Transform session keywords to the form to send to server
    if (item.title && /^(20\d\d.*)$/.test(item.title)) {
      // eslint-disable-next-line
      item.title = item.title.split(' ').join('.');
    }
    if (!existedKeywords.includes(item.title)) {
      if (item.type === 'keyword') {
        emitter.emit(EVENT_KEYS.SEARCH_PROJECT, {
          keyword: item.title,
        });
      }
      tagList.push(item);
      this.setTagList(tagList);
    }
  };

  handleRemoveTag = (item) => {
    const tagList = this.state.tagList.filter((tag) => tag.title !== item.title);
    this.setTagList(tagList);

    let { sessionFilter } = this.state;
    if (sessionFilter && item.value === sessionFilter) {
      sessionFilter = '';
      this.setState({ sessionFilter });
    }
    this.setState({ mySessionFilter: false });
  };

  handleRemoveAllTags = () => {
    if (this.state.tagList.length > 0) this.setTagList([]);
    this.setState({ mySessionFilter: false, sessionFilter: '' });
  };

  addMySessionFilter = () => {
    emitter.emit(EVENT_KEYS.FILTER_PROJECT_BY_CURRENT_SESSION);
    if (this.state.userSessions && this.state.userSessions.length > 0) {
      const tagList = this.state.userSessions.map((session, index) => ({
        id: index,
        type: 'keyword',
        title: `${session.name}.${session.program.abbr}.${session.location.abbr}`,
        value: `${session.name}.${session.program.abbr}.${session.location.abbr}`,
      })).reverse();
      this.setTagList(tagList);
      this.setState({ mySessionFilter: true, sessionFilter: '' });
    }
  };

  handleChangeSession = (newSessionFitler) => {
    let { sessionFilter } = this.state;
    if (newSessionFitler === sessionFilter) {
      sessionFilter = '';
    } else {
      sessionFilter = newSessionFitler;
    }

    let newTagList;
    if (sessionFilter) {
      // First, remove all session tags
      newTagList = this.state.tagList.filter((item) => !/^(20\d\d.*)$/.test(item.value));
      // Then prepend the new session tag to the tags list
      newTagList.unshift({
        id: sessionFilter, type: 'keyword', title: sessionFilter, value: sessionFilter,
      });
      emitter.emit(EVENT_KEYS.FILTER_PROJECT_BY_SESSION);
    } else {
      // Only remove the session tags
      newTagList = this.state.tagList.filter((item) => !/^(20\d\d.*)$/.test(item.value));
    }
    this.setState({ mySessionFilter: false, sessionFilter });
    this.setTagList(newTagList);
  };

  render() {
    return (
      <div className="content-wrapper directory">
        <div className="container">
          <div className="row">
            <div className="col-md-3 col-sm-4">
              <button
                className="btn btn-primary mb-2"
                onClick={() => this.props.showModal(ModalKey.CREATE_PROJECT)}
                style={{ width: '95%' }}
              >
                CREATE PROJECT
              </button>
              <ProjectSessionFilter
                sessions={this.state.activeSessions}
                sessionFilter={this.state.sessionFilter || ''}
                handleChangeSession={this.handleChangeSession}
                onRemoveFilter={this.handleRemoveAllTags}
                onAddFilter={this.addMySessionFilter}
                filtered={this.state.mySessionFilter}
                disabled={!this.state.userSessions || this.state.userSessions.length <= 0}
              />
            </div>

            <div className="col-md-9 col-sm-8">
              <div className="row">
                <div className="section search-filter col-sm-12 ">
                  <div className="row search">
                    <div className="search-icon">
                      <i className="fa fa-search fa-lg" />
                    </div>
                    <div className="search-box">
                      <TagList
                        tagList={this.state.tagList}
                        onRemoveTag={this.handleRemoveTag}
                        onRemoveAllTags={this.handleRemoveAllTags}
                      />
                      <SearchBox onAddTag={this.handleAddTag} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col align-self-end d-flex">
                  {this.state.totalResults !== null
                    && (
                    <h6>
                      {this.state.totalResults}
                      {' '}
                      results
                    </h6>
                    )}
                  <p className="ml-auto pl-2">
                    Projects on or before Jun 4th,
                    2018 are legacy data and do not contain detailed information
                  </p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  {this.state.projects && this.state.projects.length > 0
                  && (
                  <ProjectList
                    projects={this.state.projects}
                  />
                  )}
                  {this.state.fetching && <LoadingIndicator />}
                </div>
              </div>
            </div>
          </div>
          {this.state.projects && this.state.projects.length > 0
          && (
          <button className="back-to-top pull-right pointer" onClick={() => window.scrollTo(0, 0)}>
            <i className="fa fa-chevron-up" />
            <span>TOP</span>
          </button>
          )}
        </div>
      </div>
    );
  }
}

Projects.propTypes = {
  showModal: PropTypes.func,
};

const mapDispatchToProps = {
  showModal,
};

export default connect(null, mapDispatchToProps)(Projects);
