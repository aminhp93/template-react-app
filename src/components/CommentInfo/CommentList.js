import React from 'react';
import PropTypes from 'prop-types';
import Comment from 'components/CommentInfo/Comment';
import PusherService from 'services/Pusher';
import {
  CSSTransition,
  TransitionGroup,
} from 'react-transition-group';


class CommentList extends React.Component {
  componentDidMount = () => {
    const { postId, onReplyCommentSuccess, onCreateCommentSuccess } = this.props;
    this.channelName = `comment_post_${postId}`;

    if (onReplyCommentSuccess) {
      this.callbackFunction = onReplyCommentSuccess.bind(this);
      this.action = 'replyComment';
    } else {
      this.callbackFunction = onCreateCommentSuccess.bind(this);
      this.action = 'commentPost';
    }

    if ((!PusherService.instance[postId])
      || (this.channelName !== PusherService.instance[postId].channelName)) {
      PusherService.instance[postId] = PusherService.getInstance(postId);
      PusherService.instance[postId].connect(this.channelName);
    }

    PusherService.instance[postId]
      .addCallbacks(this.action, this.callbackFunction);

    PusherService.instance[postId].updateCommentCount = this
      .updateCommentCount.bind(this);
  };

  updateCommentCount = (parentId) => {
    this.props.onCreateSubCommentSuccess();
    this.props.onUpdateReplyCountCommentSuccess(parentId);
  };

  render() {
    const { comments, loadMore, onLoadMoreComment } = this.props;
    return (
      <div className="mb-3">
        {comments && comments.length > 0
          && (
          <TransitionGroup className="comment-list-transition">
            {comments.map((comment) => (
              <CSSTransition timeout={300} key={comment.eid} classNames="comment-item-transition">
                <Comment
                  key={comment.eid}
                  {...comment}
                  comment={comment}
                  {...this.props}
                  creator={comment.creator}
                />
              </CSSTransition>
            ))}
          </TransitionGroup>
          )}
        <div className="comment-loadmore">
          {loadMore
            && <span onClick={onLoadMoreComment}>See more comments</span>}
        </div>
      </div>
    );
  }
}

CommentList.propTypes = {
  comments: PropTypes.arrayOf(PropTypes.object),
  action: PropTypes.string,
  postId: PropTypes.number,
  loadMore: PropTypes.bool,
  onLoadMoreComment: PropTypes.func,
  onDeleteCommentSuccess: PropTypes.func,
  onCreateSubCommentSuccess: PropTypes.func,
  onUpdateReplyCountCommentSuccess: PropTypes.func,
  onCreateCommentSuccess: PropTypes.func,
  onReplyCommentSuccess: PropTypes.func,
  onThanksChange: PropTypes.func,
};

export default CommentList;
