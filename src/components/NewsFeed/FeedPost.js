import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import toastr from 'toastr';
import ReactHtmlParser from 'react-html-parser';
import { distanceInWordsToNow, parse } from 'date-fns';
import Delete from 'components/Modals/Delete';
import SessionBadge from 'components/SessionBadge';
import CommentInfo from 'components/CommentInfo/CommentInfo';
import FeedService from 'services/Feed';
import { removeFileFromS3AndStorage } from 'services/S3';
import { formatLink, formatBoldText, formatTaggedUser } from 'utils/content';
import {
  URL_ELE_REGEX, BOLD_TEXT_ELE_REGEX, EMAIL_ELE_REGEX, TAGGED_USER_REGEX,
} from 'constants/regex';
import { S3_BUCKET_PREFIX } from 'constants/common';
import userInfo, { getUserAvatar, getUserNameDisplay, getPositionDisplay } from 'utils/userInfo';
import Thanks from 'components/Thanks';
import Media from './Media';
import PostBox from './PostBox';
import { MEDIA_TYPES } from '../../utils/media';

import STAR_URL from '@img/star.png';
import PIN_ICON_URL from '@img/pin_icon.svg';


class FeedPost extends React.Component {
  static propTypes = {
    post: PropTypes.objectOf(PropTypes.any),
    onDeletePostSuccess: PropTypes.func,
    onFlagPostSuccess: PropTypes.func,
    handlePostPinned: PropTypes.func,
    handlePostUnpinned: PropTypes.func,
    handleTurnOffNotification: PropTypes.func,
    handleTurnOnNotification: PropTypes.func,
    detail: PropTypes.bool,
  };

  static defaultProps = {
    detail: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      deleting: false,
      showComment: false,
      deleteModal: false,
      showPostAction: false,
      commentCount: this.props.post.reply_count,
      showSeeMoreButton: false,
      shouldShowPostEditBox: false,
      post: this.props.post,
      seeMoreButtonActive: false,
    };
  }

  componentDidMount() {
    window.document.addEventListener('click', (e) => this.hidePostAction(e));

    if (this.content && this.content.offsetHeight > 160) {
      this.toggleSeeMore(true);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { seeMoreButtonActive } = this.state;

    if (!seeMoreButtonActive && prevState.seeMoreButtonActive && this.post) {
      this.post.scrollIntoViewIfNeeded();
    }
  }

  componentWillUnmount() {
    window.document.removeEventListener('click', (e) => this.hidePostAction(e));
  }

  onTogglePostAction = () => {
    this.setState({ showPostAction: !this.state.showPostAction });
  };

  onTurnOffNotificationClicked = (event) => {
    event.preventDefault();
    this.props.handleTurnOffNotification(this.props.post.eid);
  };

  onTurnOnNotificationClicked = (event) => {
    event.preventDefault();
    this.props.handleTurnOnNotification(this.props.post.eid);
  };

  hidePostAction = (e) => {
    if (this.postActionToggleRef && !this.postActionToggleRef.contains(e.target)
      && this.state.showPostAction) {
      this.setState({ showPostAction: false });
    }
  };

  handleShowComment = () => {
    this.setState({ showComment: !this.state.showComment });
  };

  handleCommentCountChange = (offset) => this.setState({ commentCount: this.state.commentCount + offset });

  splitParagraphs = (content) => {
    const paragraphs = content.split('\n\n');
    const { showSeeMoreButton, seeMoreButtonActive } = this.state;
    const { detail } = this.props;
    let className = '';

    if (!detail && showSeeMoreButton) {
      className = 'show-see-more';
      if (seeMoreButtonActive) {
        className += ' show-see-more--active';
      }
    }
    return (
      <>
        <div
          className={`show-hide-text wrapper ${className}`}
          ref={(ref) => this.content = ref}
        >
          {
            !detail && showSeeMoreButton
              && (
                <>
                  <span id="show-more" className="show-less" key="more" onClick={this.toggleSeeMoreActive(false)}>Show less</span>
                  <span id="show-less" className="show-more" key="less" onClick={this.toggleSeeMoreActive(true)}>Show more</span>
                </>
              )
          }
          {paragraphs.map((paragraph, idx) => (
            <p key={idx}>
              {this.parseHtmlContent(paragraph)}
            </p>
          ))}
        </div>
      </>
    );
  };

  parseHtmlContent = (text) => ReactHtmlParser(text);

  formatRichContent = (text) => {
    let content = text;
    const { post } = this.state;

    content = this.formatElement(content, URL_ELE_REGEX, formatLink, null, 'post-link');
    content = this.formatElement(content, BOLD_TEXT_ELE_REGEX, formatBoldText);
    content = this.formatElement(content, EMAIL_ELE_REGEX, formatLink, 'mailto:', 'post-link');
    content = this.formatElement(content, TAGGED_USER_REGEX, formatTaggedUser(post.mentions), null, 'post-link');

    // if (!detail && showSeeMoreButton) {
    //   content = makeExcerpt(content, LIMITED_CHARACTERS_LONG_POST);
    // }

    return content;
  };

  formatElement = (text, regex, formatFunc, prefix = null, cssClass = null) => {
    let content = text;
    let matches;
    do {
      matches = regex.exec(content);
      if (matches) {
        content = content.replace(matches[0], formatFunc(matches[1], prefix, cssClass));
      }
    } while (matches);
    return content;
  };

  showDeleteConfirm = () => this.setState({ deleteModal: true });

  hideDeleteConfirm = () => this.setState({ deleteModal: false });

  delete = (event) => {
    this.setState({ deleting: true });
    event.preventDefault();
    const { post } = this.state;

    if (post.files) {
      post.files.forEach((file) => {
        switch (file.file_type) {
          case MEDIA_TYPES.IMAGE.PNG:
          case MEDIA_TYPES.IMAGE.JPEG:
          case MEDIA_TYPES.IMAGE.BMP:
          case MEDIA_TYPES.IMAGE.JPG: {
            removeFileFromS3AndStorage({ ...file, file_prefix: S3_BUCKET_PREFIX.POST });
            break;
          }
          default:
            break;
        }
      });
    }
    FeedService.deletePost(this.props.post.eid).then(() => {
      this.setState({ deleteModal: false });
      this.props.onDeletePostSuccess(this.props.post.eid);
    }).catch((error) => {
      toastr.error(error);
      this.setState({ deleting: false });
    });
  };

  flagPost = (event) => {
    event.preventDefault();
    const { post } = this.props;
    FeedService.hidePost(post.eid).then(() => {
      this.props.onFlagPostSuccess(post.eid);
    }).catch((error) => {
      toastr.error(error);
    });
  };

  pinPost = (event) => {
    event.preventDefault();
    const { post } = this.props;
    FeedService.pinPost(post.eid).then(() => {
      post.is_pinned = true;
      this.props.handlePostPinned(post.eid);
    }).catch((error) => {
      toastr.error(error);
    });
  };

  unpinPost = (event) => {
    event.preventDefault();
    const { post } = this.props;
    FeedService.unpinPost(post.eid).then(() => {
      post.is_pinned = false;
      this.props.handlePostUnpinned(post.eid);
    }).catch((error) => {
      toastr.error(error);
    });
  };

  toggleThankPost = () => {
    const { post } = this.state;
    if (!post.thanked) {
      FeedService.thankPost(post.eid).then(() => {
        this.handleThanksChange();
        if (post.creator && post.creator.id === userInfo.getUserId()) {
          userInfo.changeReputation(1);
        }
      }).catch((error) => {
        toastr.error(error);
      });
    } else {
      FeedService.unthankPost(post.eid).then(() => {
        this.handleThanksChange();
        if (post.creator && post.creator.id === userInfo.getUserId()) {
          userInfo.changeReputation(-1);
        }
      }).catch((error) => {
        toastr.error(error);
      });
    }
  };

  handleThanksChange = () => {
    const { post } = this.state;
    post.thanked = !post.thanked;
    post.thanks_count += (post.thanked ? 1 : -1);
    this.setState({ post });
  };

  toggleSeeMoreActive = (value) => () => {
    this.setState({ seeMoreButtonActive: value });
  };

  toggleSeeMore = (value) => {
    this.setState({ showSeeMoreButton: value });
  };

  enterEditMode = () => {
    this.setState({ shouldShowPostEditBox: true, showPostAction: false });
  };

  leaveEditMode = () => {
    this.setState({ shouldShowPostEditBox: false, showPostAction: true });
  };

  handleUpdatePostSuccess = (post) => {
    this.setState({ post, shouldShowPostEditBox: false, showPostAction: false });
  };

  renderContent(text) {
    let content = text;

    content = this.formatRichContent(content);
    content = this.splitParagraphs(content);

    return content;
  }

  renderPostNotificationAction = (post) => {
    const userId = userInfo.getUserId();
    let message = null;
    let func;
    if (post && post.followers && post.followers.indexOf(userId) > -1) {
      message = 'Turn off notification for this post';
      func = this.onTurnOffNotificationClicked;
    } else if (post && post.unfollowers && post.unfollowers.indexOf(userId) > -1) {
      message = 'Turn on notification for this post';
      func = this.onTurnOnNotificationClicked;
    } else {
      return null;
    }

    return (
      <div className="post-container--dropdown" style={{ top: '1.2rem', right: '1.6rem' }}>
        <div className="card bg-white">
          <div
            className="post-container--dropdown--item wide pointer"
            onClick={func}
          >
            {message}
          </div>
        </div>
      </div>
    );
  };

  renderPostAction = (post, detail) => {
    const userId = userInfo.getUserId();
    const canEditAndDeletePost = post.creator.id === userId || userInfo.isStaff() || userInfo.canManagePlatform();
    if (detail) {
      return this.renderPostNotificationAction(post);
    }
    return (
      <div className="post-container--dropdown" style={{ top: '1.2rem', right: '1.6rem' }}>
        <div className="card bg-white">
          {canEditAndDeletePost && (
            <>
              <div
                className="post-container--dropdown--item pointer"
                onClick={this.enterEditMode}
              >
                Edit
              </div>
              <div
                className="post-container--dropdown--item pointer"
                onClick={this.showDeleteConfirm}
              >
                Delete
              </div>
            </>
          )}
          {userInfo.isStaff() && !post.is_pinned && (
          <div
            className="post-container--dropdown--item pointer"
            onClick={this.pinPost}
          >
            Pin post
          </div>
          )}
          {userInfo.isStaff() && post.is_pinned && (
          <div
            className="post-container--dropdown--item pointer"
            onClick={this.unpinPost}
          >
            Unpin post
          </div>
          )}
        </div>
      </div>
    );
  };

  render() {
    const { detail } = this.props;
    const {
      commentCount,
      showPostAction,
      showComment,
      deleteModal,
      deleting,
      shouldShowPostEditBox,
      post,
    } = this.state;
    const { creator } = post;
    const content = this.renderContent(post.content);
    const isOwnerOfSlackPost = (creator && userInfo.getUserId() === creator.id) && post.slack_id !== null;
    return (
      <>
        <div
          className="feed-post"
          ref={(ref) => this.post = ref}
        >
          <div className="feed-post--header">
            <div className="feed-post--actor">
              <div className="feed-post--actor__image">
                {creator ? (
                  <a href={`/profile/${creator.id}`} target="_blank" rel="noreferrer">
                    <img src={getUserAvatar(creator)} alt={getUserNameDisplay(creator)} className="rounded-image" />
                  </a>
                ) : (
                  <img src={getUserAvatar(creator)} alt={getUserNameDisplay(creator)} className="rounded-image" />
                )}
              </div>
              <div className="feed-post--actor__meta">
                <h4 className="feed-post--actor__title">
                  {creator ? (
                    <a href={`/profile/${creator.id}`} target="_blank" rel="noreferrer">
                      <span className="actor__name">{getUserNameDisplay(creator)}</span>
                    </a>
                  ) : (
                    <span className="actor__name">Insight User</span>
                  )}
                  <SessionBadge creator={creator} />
                  {creator
                  && (
                  <span className="user-info--reputation mt-2 ml-2" style={{ position: 'relative', top: '-1px' }}>
                    <img src={STAR_URL} alt="Heart" style={{ width: '14px' }} />
                    <span className="font-weight-normal" style={{ fontSize: '.8rem' }}>
                      {creator.reputation}
                      {' '}
                      Thanks
                    </span>
                  </span>
                  )}
                </h4>
                <div className="feed-post--actor__description">
                  <span className="actor__position" style={{ marginRight: '1.5em' }}>{getPositionDisplay(creator)}</span>
                  <Link to={`/feed/${this.props.post.eid}`}>
                    <span>{`${distanceInWordsToNow(parse(post.created))} ago`}</span>
                  </Link>
                  {post.is_edited && <span className="ml-2 feed-post__edited">(Edited)</span>}
                </div>
              </div>
            </div>
            <div className="feed-post--action">
              {!detail && post.is_pinned && (
              <img
                src={PIN_ICON_URL}
                alt="Pinned"
                className="pinned-post"
              />
              )}
              {!detail && userInfo.canManagePlatform() && (
              <i className="fa fa-flag flag-post-button" onClick={this.flagPost} />
              )}
              {!shouldShowPostEditBox && (
              <i
                ref={(ref) => this.postActionToggleRef = ref}
                className="fa fa-ellipsis-v fa-2x pointer ml-2 pull-right mt-1"
                onClick={() => this.onTogglePostAction()}
              />
              )}
            </div>
            {showPostAction && this.renderPostAction(post)}
          </div>
          {
            shouldShowPostEditBox ? (
              <PostBox
                post={post}
                onCancel={this.leaveEditMode}
                onCreatePostSuccess={this.handleUpdatePostSuccess}
              />
            ) : (
              <article className="feed-post--article">
                <div className="feed-post--content">
                  {content}
                </div>
              </article>
            )
          }
          {
            !shouldShowPostEditBox && (
              <>
                <div className="feed-post--media">
                  <Media sources={post.files} />
                </div>
                <div className="feed-post--action-bar">
                  <div className="feed-post--social-actions">
                    <Thanks
                      className="pull-left"
                      onClick={this.toggleThankPost}
                      thanked={post.thanked}
                      thanksCount={post.thanks_count}
                    />
                    <span className="comment-button social-action__btn" onClick={this.handleShowComment}>
                      <i className="fa fa-comment fa-comment-icon mr-1" />
                      {`${commentCount || '0'}`}
                    </span>
                  </div>
                  {isOwnerOfSlackPost
                  && (
                  <div className="feed-post--noti-actions">
                    <span className="slack-post--label">Your post was imported from Slack</span>
                  </div>
                  )}
                </div>
              </>
            )
          }
          <CommentInfo
            appLabel="newsfeed"
            modelType="post"
            parentId={post.eid}
            show={detail || showComment}
            detail={detail}
            commentCount={this.state.commentCount}
            onCommentCountChange={this.handleCommentCountChange}
          />
          {deleteModal
            && (
            <Delete
              isOpen={deleteModal}
              close={this.hideDeleteConfirm}
              delete={this.delete}
              deleting={deleting}
              targetType="post"
            />
            )}
        </div>
      </>
    );
  }
}

export default FeedPost;
