import React from 'react';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import history from 'utils/history';
import QueryString from 'utils/queryString';
import FeedService from 'services/Feed';
import UserInfo from 'components/NewsFeed/UserInfo';
import PageTitle from 'components/PageTitle';
import FeedPost from 'components/NewsFeed/FeedPost';
import LoadingIndicator from 'components/LoadingIndicator';
import emitter, { EVENT_KEYS } from 'utils/event';
import userInfo from 'utils/userInfo';

const logger = new Logger('pages/FeedDetails');


class FeedDetail extends React.Component {
  constructor(props) {
    super(props);
    const { search } = history.location;
    this.currentParams = search ? QueryString.parse(search) : {};
    this.state = {
      feed: null,
      loading: true,
      showNotification: false,
      notificationMessage: null,
      notificationType: null,
    };
  }

  componentDidMount() {
    // eslint-disable-next-line
    const eid = this.props.match.params.id;
    FeedService.getFeedById(eid).then((res) => {
      this.setState({
        feed: res.data,
        loading: false,
      });
    });
    if (this.currentParams) {
      const { action } = this.currentParams;
      const { source } = this.currentParams;
      if (action === 'unfollow') {
        this.unfollowPost(eid);
      } else if (action === 'view_post' && source === 'email_notification') {
        // Add amplitude event
        emitter.emit(EVENT_KEYS.VIEW_NEWS_FEED_POST, {
          userId: userInfo.getUserId(),
          source,
        });
      } else if (action === 'view_post' && source === 'slack') {
        // Add amplitude event
        emitter.emit(EVENT_KEYS.VIEW_NEWS_FEED_FROM_SLACK, {
          userId: userInfo.getUserId(),
          feedUrl: window.location.href,
          source,
        });
      }
    }
  }

  unfollowPost = (eid) => {
    // tslint:disable-next-line
    const user_id = userInfo.getUserId();
    FeedService.unfollowPost(eid, { user_id }).then((res) => {
      if (res && res.data) {
        this.setState({
          feed: res.data,
          notificationMessage: 'You have turned off notifications for this post',
          showNotification: true,
          notificationType: 'warning',
        });
      }
    }).catch((error) => {
      if (error.data && error.data.error_code === 'invalid_paramter') {
        this.setState({ notificationMessage: error.data.error_message });
      }
    });
  };

  followPost = (eid) => {
    // tslint:disable-next-line
    const user_id = userInfo.getUserId();
    FeedService.followPost(eid, { user_id }).then((res) => {
      if (res && res.data) {
        this.setState({
          feed: res.data,
          notificationMessage: 'You have turned on notifications for this post',
          showNotification: true,
          notificationType: 'success',
        });
      }
    }).catch((error) => {
      logger.error(error);
    });
  };

  handleThanksChange = () => {
    const feed = { ...this.state.feed };
    feed.thanked = !feed.thanked;
    this.setState({ feed });
  };

  renderNotification = () => {
    const message = this.state.notificationMessage;
    const { notificationType } = this.state;
    return (
      <div className="nf--notification--container">
        <div className="message">
          <i className={`fa fa-bell-slash text-${notificationType} mr-2`} />
          {message}
        </div>
        <i className="fa fa-times ml-2 pointer close-button" onClick={() => this.setState({ showNotification: false })} />
      </div>
    );
  };

  render() {
    const { loading, feed, showNotification } = this.state;
    if (loading || !feed) return <LoadingIndicator />;

    const post = feed;

    return (
      <>
        <PageTitle title="News Feed" />
        <div className="newsfeed-container">
          <div className="container">
            <aside className="nf--side-column">
              <UserInfo />
            </aside>
            <main className="nf--primary-column">
              {showNotification && this.renderNotification()}
              <FeedPost
                detail
                post={post}
                key={post.eid}
                loading={loading}
                handleTurnOffNotification={this.unfollowPost}
                handleTurnOnNotification={this.followPost}
                onThanksChange={this.handleThanksChange}
              />
            </main>
          </div>
        </div>
      </>
    );
  }
}

export default FeedDetail;
