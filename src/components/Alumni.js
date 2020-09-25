import React from 'react';
import AlumniService from 'services/Alumni';
import history from 'utils/history';
import QueryString from 'utils/queryString';
import SearchFilter from './SearchFilter';
import AlumnusList from './AlumnusList';
// import FilterMenu from './FilterMenu';
import LoadingIndicator from './LoadingIndicator';

class Alumni extends React.Component {
  constructor(props) {
    super(props);
    const { search } = history.location;
    this.currentParams = search ? QueryString.parse(search) : {};
    this.state = {
      alumni: [],
      totalResults: null,
      fetching: false,
      page: 1,
      end: false,
    };
    this.fetchAlumni = this.fetchAlumni.bind(this);
    this.fetchMore = this.fetchMore.bind(this);
  }

  componentDidMount() {
    this.fetchAlumni();
    window.addEventListener('scroll', this.checkScrollFetchMore);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.checkScrollFetchMore);
    this.handleAlumniSuccessResponse = () => {};
    this.handleAlumniErrorResponse = () => {};
  }

  fetchAlumni(tagList) {
    const params = {
      page: tagList ? 1 : this.state.page,
    };
    let extraParams = {};
    if (tagList) {
      this.setState({ page: 1, alumni: [] });
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
    AlumniService.getAlumni({ ...params, ...extraParams }, tagList)
      .then(this.handleAlumniSuccessResponse)
      .catch(this.handleAlumniErrorResponse);
  }

  handleAlumniSuccessResponse = (res) => {
    const isLastRequest = res && this.currentTagList === res.tagList;
    if (res && res.data && res.data.results && isLastRequest) {
      this.setState({
        alumni: res.tagList ? res.data.results : [...this.state.alumni, ...res.data.results],
        totalResults: res.data.count,
        end: res.data.next === null,
        fetching: false,
      });
    }
  };

  handleAlumniErrorResponse = () => {
    this.setState({ fetching: false, end: true });
  };

  fetchMore() {
    if (!this.state.fetching && !this.state.end) {
      this.setState({
        page: this.state.page + 1,
      }, () => this.fetchAlumni());
    }
  }

  checkScrollFetchMore = () => {
    if (window.innerHeight + window.scrollY
        > document.getElementsByClassName('page-content')[0].clientHeight - 200) {
      this.fetchMore();
    }
  };

  render() {
    return (
      <div className="content-wrapper directory">
        <div className="container">
          <div className="row">
            <div className="col-sm-12 mb-2">
              <SearchFilter fetchAlumni={this.fetchAlumni} initialParams={this.currentParams} />
              {this.state.totalResults !== null
              && (
              <h6 className="ml-3">
                {this.state.totalResults}
                {' '}
                results
              </h6>
              )}
              {this.state.alumni && this.state.alumni.length > 0
              && (
              <AlumnusList
                alumni={this.state.alumni}
              />
              )}
              {this.state.fetching && <LoadingIndicator />}
              {this.state.alumni && this.state.alumni.length > 0
                && (
                <button className="back-to-top pointer" onClick={() => window.scrollTo(0, 0)}>
                  <i className="fa fa-chevron-up" />
                  <span>TOP</span>
                </button>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Alumni;
