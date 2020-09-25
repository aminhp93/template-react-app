import React from 'react';
import toastr from 'toastr';
import PropTypes from 'prop-types';
import ReactHtmlParser from 'react-html-parser';
import { distanceInWordsToNow, parse } from 'date-fns';
import CommentService from 'services/Comment';
import userInfo from 'utils/userInfo';
import { formatRichContent } from 'utils/content';
import {
  DEFAULT_PROFILE_IMAGE_URL, S3_BUCKET_PREFIX,
} from 'constants/common';
import Delete from 'components/Modals/Delete';
import LoadingIndicator from 'components/LoadingIndicator';
import SessionBadge from 'components/SessionBadge';
import CommentList from 'components/CommentInfo/CommentList';
import CommentForm from 'components/CommentInfo/CommentForm';
import Thanks from 'components/Thanks';
import Media from 'components/NewsFeed/Media';
import { MEDIA_TYPES } from 'utils/media';
import { removeFileFromS3AndStorage } from 'services/S3';

import STAR_URL from '@img/star.png';


class Comment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showReplyForm: false,
      showSubCommentList: false,
      replyCount: props.reply_count,
      subComments: [],
      page: 1,
      loadMore: false,
      loadMoreCommand: false,
      deleteModal: false,
      deleting: false,
      focusCommentContent: false,
      content: props.content,
      subCommentResultCount: 0,
      loadingSubComments: false,
      showDropdown: false,
      showSeeMoreButton: false,
      seeMoreButtonActive: false,
      files: props.files,
      mentions: props.mentions,
      comment: props.comment,
      showCommentAction: true,
    };
  }

  componentDidMount() {
    window.document.addEventListener('click', (e) => this.hideDropdown(e));
    if (this.content && this.content.offsetHeight > 160) {
      this.toggleSeeMore(true);
    }
  }

  componentWillReceiveProps = (newProps) => {
    this.setState({ replyCount: newProps.reply_count });
  };

  componentWillUnmount() {
    window.document.removeEventListener('click', (e) => this.hideDropdown(e));
  }

  onShowReplyForm = () => {
    this.setState(this.state.subComments.length ? {
      showReplyForm: !this.state.showReplyForm,
      showSubCommentList: !this.state.showReplyForm,
    } : {
      showReplyForm: !this.state.showReplyForm,
      showSubCommentList: !this.state.showReplyForm,
      loadingSubComments: true,
    }, () => {
      this.fetchSubComments();
    });
  };

  onShowSubCommentList = () => {
    this.setState(this.state.subComments.length ? {
      showSubCommentList: !this.state.showSubCommentList,
    } : {
      showSubCommentList: !this.state.showSubCommentList,
      loadingSubComments: true,
    }, () => {
      this.fetchSubComments();
    });
  };

  onToggleDropdown = () => {
    this.setState({ showDropdown: !this.state.showDropdown });
  };

  hideDropdown = (e) => {
    if (this.dropDownToggleRef && !this.dropDownToggleRef.contains(e.target)
        && this.state.showDropdown) {
      this.setState({ showDropdown: false });
    }
  };

  triggerShowCommentList = () => {
    if (!this.state.showSubCommentList) {
      this.setState({ showSubCommentList: true });
    }
  };

  handleLoadMoreComment = () => {
    this.setState({
      loadMoreCommand: true,
      loadingSubComments: true,
    }, () => {
      this.fetchSubComments();
    });
  };

  fetchSubComments = () => {
    if (this.state.showSubCommentList) {
      const page = this.state.loadMoreCommand ? this.state.page + 1 : this.state.page;

      CommentService.getCommentByParentId('comments', 'comment', this.props.eid, page).then((res) => {
        const subComments = res.data.results;
        const loadMore = res.data.next !== null;

        if (this.state.subComments.length === 0) {
          this.setState({ subComments });
        }

        if (this.state.subComments && this.state.loadMoreCommand) {
          this.setState({
            loadMoreCommand: false,
            subComments: this.state.subComments.concat(subComments),
          });
        }

        const subCommentResultCount = this.state.subComments.length;
        const loadingSubComments = false;
        const replyCount = subComments.length;

        this.setState({
          loadMore, page, subCommentResultCount, loadingSubComments, replyCount,
        });
      }).catch(() => {
        toastr.error('Something went wrong!');
      });
    }
  };

  handleReplyCommentSuccess = (newSubComment) => {
    this.setState({
      showSubCommentList: true,
      subComments: [...this.state.subComments, newSubComment],
      replyCount: this.state.replyCount + 1,
    });

    this.props.onCreateSubCommentSuccess();
    this.props.onUpdateReplyCountCommentSuccess(newSubComment.object_id);
  };

  showDeleteConfirm = () => {
    this.setState({
      deleteModal: true,
    });
  };

  hideDeleteConfirm = () => {
    this.setState({
      deleteModal: false,
    });
  };

  delete = (event) => {
    this.setState({ deleting: true });
    event.preventDefault();
    const { files } = this.state;

    if (files) {
      files.forEach((file) => {
        switch (file.file_type) {
          case MEDIA_TYPES.IMAGE.PNG:
          case MEDIA_TYPES.IMAGE.JPEG:
          case MEDIA_TYPES.IMAGE.BMP:
          case MEDIA_TYPES.IMAGE.JPG: {
            removeFileFromS3AndStorage({ ...file, file_prefix: S3_BUCKET_PREFIX.COMMENT });
            break;
          }
          default:
            break;
        }
      });
    }
    CommentService.deleteComment(this.props.eid).then(() => {
      this.setState({ deleteModal: false });
      this.props.onDeleteCommentSuccess(this.props.eid);
    }).catch((error) => {
      toastr.error(error);
      this.setState({ deleting: false });
    });
  };

  handleDeleteSubCommentSuccess = (subCommentId) => {
    this.setState({
      subComments: this.state.subComments.filter((subComment) => subComment.eid !== subCommentId),
      replyCount: this.state.replyCount - 1,
    });

    if (this.state.replyCount <= this.state.subCommentResultCount) {
      this.setState({ page: this.state.page - 1 });
    }
  };

  handleFocusCommentContent = () => {
    this.setState({ focusCommentContent: !this.state.focusCommentContent });
  };

  handleEditComment = (event) => {
    if (event.keyCode === 13 && event.shiftKey === false) {
      event.preventDefault();
      CommentService.editComment(this.props.eid, { content: this.state.content }).then((res) => {
        this.setState({
          focusCommentContent: false,
          content: res.data.content,
        });
      }).catch(() => {
        toastr.error('Something went wrong!');
      });
    }
  };

  handleChange = (event) => {
    this.setState({ content: event.target.value });
  };

  toggleThankComment = () => {
    const { props: comment } = this;
    if (!comment.thanked) {
      CommentService.thankComment(comment.eid).then(() => {
        this.props.onThanksChange(comment.eid);
        if (comment.creator && comment.creator.id === userInfo.getUserId()) {
          userInfo.changeReputation(1);
        }
      }).catch((error) => {
        toastr.error(error);
      });
    } else {
      CommentService.unthankComment(comment.eid).then(() => {
        this.props.onThanksChange(comment.eid);
        if (comment.creator && comment.creator.id === userInfo.getUserId()) {
          userInfo.changeReputation(-1);
        }
      }).catch((error) => {
        toastr.error(error);
      });
    }
  };

  toggleSeeMore = (value) => {
    this.setState({ showSeeMoreButton: value });
  };

  toggleSeeMoreActive = (value) => () => {
    this.setState({ seeMoreButtonActive: value });
  };

  handleEnterEditMode = (comment) => () => {
    this.setState(({ shouldShowPostEditBox, showCommentAction }) => ({
      shouldShowPostEditBox: !shouldShowPostEditBox,
      showCommentAction: !showCommentAction,
      showDropdown: false,
    }));
    if (comment) {
      this.setState({
        content: comment.content,
        files: comment.files,
        mentions: comment.mentions,
        comment,
      });
    }
  };

  renderContent = () => {
    const { mentions } = this.state;
    const content = formatRichContent(this.state.content, mentions);

    return content ? ReactHtmlParser(content) : null;
  };

  render() {
    const {
      replyCount, seeMoreButtonActive, showSeeMoreButton, shouldShowPostEditBox, files,
      comment, showCommentAction,
    } = this.state;
    const {
      creator, slack_id,
    } = this.props;
    const userId = userInfo.getUserId();
    // eslint-disable-next-line
    const isOwnerOfSlackPost = userId === creator.id && slack_id;
    const canEditAndDeleteComment = creator.id === userId || userInfo.isStaff() || userInfo.canManagePlatform();
    const formattedContent = this.renderContent();
    let className = '';

    if (showSeeMoreButton) {
      className = 'show-see-more';
      if (seeMoreButtonActive) {
        className += ' show-see-more--active';
      }
    }

    const commentAction = canEditAndDeleteComment && (
      <div className="post-container--dropdown">
        <div className="card bg-white">
          <div
            className="post-container--dropdown--item pointer"
            onClick={this.handleEnterEditMode()}
          >
            Edit
          </div>
        </div>
        <div className="card bg-white">
          <div
            className="post-container--dropdown--item pointer"
            onClick={this.showDeleteConfirm}
          >
            Delete
          </div>
        </div>
      </div>
    );

    return (
      <div className="comment-item">
        <div className="user-avar-img">
          <img
            className="profile--image"
            // eslint-disable-next-line
            src={(creator && creator.profile && creator.profile.profile_image) || DEFAULT_PROFILE_IMAGE_URL}
            alt="Profile"
          />
        </div>
        <div className={`comment-detail ${showSeeMoreButton ? 'image-padding' : ''}`}>
          <div className="comment-action">
            {creator ? (
              <a href={`/profile/${creator.id}`} target="_blank" rel="noreferrer">
                <span className="cm-user-name mr-2">
                  {creator.first_name}
                  {' '}
                  {creator.last_name}
                </span>
              </a>
            ) : (
              <span className="cm-user-name mr-2">Insight User</span>
            )}
            {creator && (!this.props.action || this.props.action !== 'showSubCommentList')
              && <SessionBadge creator={creator} />}
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
            {
              comment.is_edited && (
                <span className="ml-2 feed-post__edited">(Edited)</span>
              )
            }
            {creator && (creator.id === userInfo.getUserId()) && showCommentAction
              && (
              <i
                ref={(ref) => this.dropDownToggleRef = ref}
                className="fa fa-ellipsis-v fa-lg pointer ml-2 pull-right mt-1"
                onClick={() => this.onToggleDropdown()}
              />
              )}
            <span className="cm-timestamp pull-right">{`${distanceInWordsToNow(parse(this.props.created))} ago`}</span>
            {this.state.showDropdown && showCommentAction && commentAction}
          </div>
          <div className={`comment-content ${shouldShowPostEditBox ? 'edit-comment' : ''}`}>
            <div className="comment-content--container">
              {
                shouldShowPostEditBox ? (
                  <CommentForm
                    action="replyComment"
                    commentId={this.props.eid}
                    postId={this.props.postId}
                    comment={comment}
                    onCancel={this.handleEnterEditMode}
                    triggerShowCommentList={this.triggerShowCommentList}
                  />
                ) : (
                  <div
                    style={{ whiteSpace: 'pre-wrap' }}
                    className={`show-hide-text wrapper ${className}`}
                  >
                    {
                      showSeeMoreButton
                        && (
                          <>
                            <span id="show-more" className="show-less" onClick={this.toggleSeeMoreActive(false)}>Show less</span>
                            <span id="show-less" className="show-more" onClick={this.toggleSeeMoreActive(true)}>Show more</span>
                          </>
                        )
                    }
                    <div
                      className="comment-content--detail"
                      ref={(ref) => this.content = ref}
                    >
                      {formattedContent}
                    </div>
                  </div>
                )
              }
            </div>
          </div>
          { !shouldShowPostEditBox && <Media sources={files} fromComment />}
          <div className="comment-reactions">
            <div className="thanks-reaction">
              <Thanks
                className="comment-thanks position-relative"
                onClick={this.toggleThankComment}
                thanked={this.props.thanked}
                thanksCount={this.props.thanks_count}
              />
            </div>
            {isOwnerOfSlackPost
              && (
              <div className="label-reaction">
                <span className="slack-post--label">Your post was imported from Slack</span>
              </div>
              )}
          </div>
          {this.props.action && this.props.action === 'showSubCommentList'
            ? ''
            : (
              <div className="sub-comment-info">
                {replyCount && replyCount > 0
                  ? (
                    <a onClick={this.onShowSubCommentList}>
                      {replyCount}
                      {' '}
                      {`repl${replyCount > 1 ? 'ies' : 'y'}`}
                    </a>
                  )
                  : ''}
              </div>
            )}
          {this.state.showSubCommentList
            && (
            <CommentList
              comments={this.state.subComments}
              action="showSubCommentList"
              creator={this.props.creator}
              loadMore={this.state.loadMore}
              onLoadMoreComment={this.handleLoadMoreComment}
              onDeleteCommentSuccess={this.handleDeleteSubCommentSuccess}
              onReplyCommentSuccess={this.handleReplyCommentSuccess}
              postId={this.props.postId}
            />
            )}
          {this.state.loadingSubComments
            && <LoadingIndicator />}
          {this.state.showReplyForm
            && (
            <CommentForm
              action="replyComment"
              commentId={this.props.eid}
              postId={this.props.postId}
              triggerShowCommentList={this.triggerShowCommentList}
            />
            )}
          {this.state.deleteModal
            && (
            <Delete
              isOpen={this.state.deleteModal}
              close={this.hideDeleteConfirm}
              delete={this.delete}
              deleting={this.state.deleting}
              targetType="comment"
            />
            )}
        </div>
      </div>
    );
  }
}

Comment.propTypes = {
  content: PropTypes.string,
  action: PropTypes.string,
  eid: PropTypes.number,
  creator: PropTypes.objectOf(PropTypes.any),
  created: PropTypes.string,
  slack_id: PropTypes.string,
  reply_count: PropTypes.number,
  onDeleteCommentSuccess: PropTypes.func,
  onCreateSubCommentSuccess: PropTypes.func,
  onUpdateReplyCountCommentSuccess: PropTypes.func,
  postId: PropTypes.number,
  thanked: PropTypes.bool,
  thanks_count: PropTypes.number,
  onThanksChange: PropTypes.func,
  mentions: PropTypes.arrayOf(PropTypes.shape()),
  files: PropTypes.arrayOf(PropTypes.shape({
    file_key: PropTypes.string.isRequired,
    file_type: PropTypes.string.isRequired,
    file_prefix: PropTypes.string,
  })),
  comment: PropTypes.shape({}).isRequired,
};

Comment.defaultProps = {
  mentions: [],
};

export default Comment;
