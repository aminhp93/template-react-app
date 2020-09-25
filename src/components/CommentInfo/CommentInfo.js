import React from 'react';
import toastr from 'toastr';
import CommentForm from 'components/CommentInfo/CommentForm';
import CommentList from 'components/CommentInfo/CommentList';
import PropTypes from 'prop-types';
import LoadingIndicator from 'components/LoadingIndicator';
import CommentService from 'services/Comment';
import emitter, { EVENT_KEYS } from 'utils/event';


class CommentInfo extends React.Component {
  state = {
    comments: [],
    commentResultCount: 0,
    loadingComments: false,
    page: 1,
  };

  componentDidMount() {
    if (this.props.detail) {
      this.fetchCommentsByPostId();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show !== this.props.show && nextProps.show && nextProps.commentCount > 0) {
      this.fetchCommentsByPostId();
      if (this.props.appLabel === 'newsfeed') {
        emitter.emit(EVENT_KEYS.VIEW_NEWS_FEED_POST_COMMENTS);
      }
    }
  }

  fetchCommentsByPostId = () => {
    const page = this.state.loadMoreCommand ? this.state.page + 1 : this.state.page;
    CommentService.getCommentByParentId(
      this.props.appLabel, this.props.modelType,
      this.props.parentId, page,
    ).then((res) => {
      const comments = res.data.results;
      const loadMore = res.data.next !== null;

      if (this.state.comments.length === 0) {
        this.setState({ comments });
      }

      if (this.state.comments && this.state.loadMoreCommand) {
        this.setState({
          loadMoreCommand: false,
          comments: this.state.comments.concat(comments),
        });
      }

      const commentResultCount = this.state.comments.length;
      const loadingComments = false;

      this.setState({
        loadMore, page, commentResultCount, loadingComments,
      });
    }).catch(() => {
      toastr.error('Something went wrong!');
    });
  };

  handleLoadMoreComment = () => {
    this.setState({
      loadMoreCommand: true,
      loadingComments: true,
    }, () => {
      this.fetchCommentsByPostId();
    });
  };

  handleDeleteCommentSuccess = (commentId) => {
    const commentObject = this.state.comments.filter((comment) => comment.eid === commentId)[0];

    this.setState({
      comments: this.state.comments.filter((comment) => comment.eid !== commentId),
    });
    this.props.onCommentCountChange(-(1 + (commentObject.reply_count || 0)));

    if (this.state.commentCount <= this.state.commentResultCount) {
      this.setState({ page: this.state.page - 1 });
    }
  };

  handleCreateCommentSuccess = (newComment) => {
    this.setState({
      comments: [...this.state.comments, newComment],
    });
    this.props.onCommentCountChange(1);
  };

  updateReplyCountCommentSuccess = (commentId) => {
    const commentList = this.state.comments;
    const commentIndex = commentList.indexOf(commentList.filter((comment) => comment.eid === commentId)[0]);
    commentList[commentIndex].reply_count += 1
    this.setState({ comments: commentList })
  };

  handleCreateSubCommentSuccess = () => {
    this.props.onCommentCountChange(1);
  };

  handleThanksChange = (commentEid) => {
    this.setState({
      comments: this.state.comments.map((comment) => {
        if (comment.eid === commentEid) {
          const newComment = { ...comment };
          newComment.thanked = !newComment.thanked;
          newComment.thanks_count += (newComment.thanked ? 1 : -1);
          return newComment;
        }
        return comment;
      }),
    });
  };

  render() {
    let result = '';

    if (this.props.show) {
      const { comments, loadMore, loadingComments } = this.state;
      const { appLabel, modelType, parentId } = this.props;
      result = (
        <div className="comment-body">
          <CommentForm
            appLabel={appLabel}
            modelType={modelType}
            postId={parentId}
            action="commentPost"
          />
          <CommentList
            postId={parentId}
            comments={comments}
            loadMore={loadMore}
            onLoadMoreComment={this.handleLoadMoreComment}
            onDeleteCommentSuccess={this.handleDeleteCommentSuccess}
            onCreateSubCommentSuccess={this.handleCreateSubCommentSuccess}
            onUpdateReplyCountCommentSuccess={this.updateReplyCountCommentSuccess}
            onCreateCommentSuccess={this.handleCreateCommentSuccess}
            onThanksChange={this.handleThanksChange}
          />
          {loadingComments
            && <LoadingIndicator />}
        </div>
      );
    }
    return result;
  }
}

CommentInfo.propTypes = {
  show: PropTypes.bool,
  detail: PropTypes.bool,
  parentId: PropTypes.number.isRequired,
  appLabel: PropTypes.string,
  modelType: PropTypes.string,
  commentCount: PropTypes.number,
  onCommentCountChange: PropTypes.func.isRequired,
};

CommentInfo.defaultProps = {
  detail: false,
};

export default CommentInfo;
