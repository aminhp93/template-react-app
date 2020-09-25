import * as React from 'react';
import { ConsoleLogger as Logger } from '@aws-amplify/core';

import PageTitle from 'components/PageTitle';
import UserInfo from 'components/NewsFeed/UserInfo';
import FeedPost from 'components/NewsFeed/FeedPost';
import PostBox from 'components/NewsFeed/PostBox';
import LoadingIndicator from 'components/LoadingIndicator';
import { Alert, Button } from 'reactstrap';

import FeedService from 'services/Feed';

const logger = new Logger('pages/newsfeed');

const FIRST_PINNED_POST_LENGTH = 2;

class NewsFeed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      feed: [],
      feedPinned: [],
      feedPinnedHidden: null,
      loading: false,
      page: 1,
      end: false,
      pagePinned: 1,
      endPinned: true,
      visibleAlertPinned: true,
    };
  }

  componentDidMount() {
    this.getNewsFeed();
    this.getNewsFeedPinned();
    window.addEventListener('scroll', this.checkScrollFetchMore);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.checkScrollFetchMore);
  }

  onCreatePostSuccess = (post) => {
    const { feed } = this.state;
    feed.unshift(post);
    this.setState({ feed });
  };

  onDismissAlertPinned = () => {
    this.setState({ visibleAlertPinned: false });
  };

  getNewsFeed() {
    this.setState({ loading: true });
    const params = {
      page: this.state.page,
    };

    FeedService.getFeed({ ...params })
      .then((res) => {
        if (res && res.data) {
          this.setState({
            loading: false,
            end: !res.data.next,
            feed: [...this.state.feed, ...res.data.results],
          });
        }
      })
      .catch((error) => {
        logger.error(error);
      });
  }

  getNewsFeedPinned() {
    this.setState({ loading: true });
    const params = {
      page: this.state.pagePinned,
    };

    FeedService.getFeedPinned({ ...params })
      .then((res) => {
        if (res && res.data) {
          let addition;
          if (this.state.pagePinned <= 1 && res.data.results.length > FIRST_PINNED_POST_LENGTH) {
            addition = res.data.results.slice(0, FIRST_PINNED_POST_LENGTH);
            this.setState({
              feedPinnedHidden: res.data.results.slice(FIRST_PINNED_POST_LENGTH, res.data.results.length),
            });
          } else {
            addition = res.data.results;
          }

          this.setState({
            loading: false,
            endPinned: res.data.next === null,
            feedPinned: [...this.state.feedPinned, ...addition],
          });
        }
      })
      .catch((error) => {
        logger.error(error);
      });
  }

  fetchMore = () => {
    if (!this.state.loading && !this.state.end) {
      this.setState({
        page: this.state.page + 1,
      }, () => this.getNewsFeed());
    }
  };

  fetchMorePinned = () => {
    if (this.state.feedPinnedHidden && this.state.feedPinnedHidden.length > 0) {
      this.setState({
        feedPinned: [...this.state.feedPinned, ...this.state.feedPinnedHidden],
        feedPinnedHidden: []
      });
    } else if (!this.state.loading && !this.state.endPinned) {
      this.setState({
        pagePinned: this.state.pagePinned + 1,
      }, () => this.getNewsFeedPinned());
    }
  };

  checkScrollFetchMore = () => {
    if (window.innerHeight + window.scrollY
      > document.getElementsByClassName('newsfeed-container')[0].clientHeight - 200) {
      this.fetchMore();
    }
  };

  handlePostDeleted = (postEid) => {
    this.setState({
      feed: this.state.feed.filter((post) => post.eid !== postEid),
      feedPinned: this.state.feedPinned.filter((post) => post.eid !== postEid),
    });
  };

  handlePostFlagged = (postEid) => {
    // TODO: Combine this method and the above
    this.setState({ feed: this.state.feed.filter((post) => post.eid !== postEid) });
  };

  handlePostPinned = (postEid) => {
    // TODO: Combine this method and the above
    const arPinned = this.state.feed.filter((post) => post.eid === postEid);
    let arRemoved = this.state.feedPinned;
    if (this.state.feedPinned.length >= FIRST_PINNED_POST_LENGTH) {
      arRemoved = this.state.feedPinned.slice(0, this.state.feedPinned.length - 1);
    }
    this.setState({
      feed: this.state.feed.filter((post) => post.eid !== postEid),
      feedPinned: [...arPinned, ...arRemoved],
    });
  };

  handlePostUnpinned = (postEid) => {
    // TODO: Combine this method and the above
    const arUnpinned = this.state.feedPinned.filter((post) => post.eid === postEid);
    this.setState({
      feedPinned: this.state.feedPinned.filter((post) => post.eid !== postEid),
      feed: [...arUnpinned, ...this.state.feed],
    });
  };

  render() {
    const {
      feed, feedPinned, loading, endPinned, feedPinnedHidden,
    } = this.state;

    return (
      <>
        <PageTitle title="News Feed" />
        <div className="newsfeed-container">
          <div className="container">
            <aside className="nf--side-column">
              <UserInfo />
            </aside>
            <main className="nf--primary-column">
              <PostBox onCreatePostSuccess={this.onCreatePostSuccess} />
              {feedPinned && feedPinned.length > 0
              && (
              <Alert
                color="light"
                isOpen={this.state.visibleAlertPinned}
                toggle={this.onDismissAlertPinned}
                style={{ marginBottom: 25, lineHeight: '1em' }}
              >
                <span className="fa fa-angle-double-down font-weight-bold" style={{ fontSize: 23, marginRight: '0.5em' }} />
                <strong>You might have missed</strong>
              </Alert>
              )}
              {feedPinned && feedPinned.map((post) => (
                <FeedPost
                  post={post}
                  key={post.eid}
                  loading={loading}
                  onDeletePostSuccess={this.handlePostDeleted}
                  onFlagPostSuccess={this.handlePostFlagged}
                  handlePostUnpinned={this.handlePostUnpinned}
                />
              ))}

              {(!endPinned || (feedPinnedHidden && feedPinnedHidden.length > 0))
                && (
                <div className="row" style={{ textAlign: 'center', marginBottom: 25 }}>
                  <div className="col-md">
                    <hr />
                  </div>
                  <div className="col-sm-auto">
                    <Button
                      color="light"
                      style={{
                        borderRadius: 25,
                        borderColor: '#90a6e5',
                        borderWidth: 1,
                        fontWeight: 'bold',
                      }}
                      onClick={this.fetchMorePinned}
                    >
                      &nbsp;&nbsp;&nbsp;&nbsp;More&nbsp;&nbsp;&nbsp;&nbsp;
                    </Button>
                  </div>
                  <div className="col-md">
                    <hr />
                  </div>
                </div>
                )}

              {feed && feed.map((post) => (
                <FeedPost
                  post={post}
                  key={post.eid}
                  loading={loading}
                  onDeletePostSuccess={this.handlePostDeleted}
                  onFlagPostSuccess={this.handlePostFlagged}
                  handlePostPinned={this.handlePostPinned}
                />
              ))}
              {loading && <LoadingIndicator />}
            </main>
          </div>
        </div>
      </>
    );
  }
}

export default NewsFeed;
