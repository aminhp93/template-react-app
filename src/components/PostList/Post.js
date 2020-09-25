import React from 'react';
import toastr from 'toastr';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import uuid from 'uuid/v4';
import { distanceInWordsToNow, parse } from 'date-fns';
import { makeFullUrl, linkify } from 'utils/url';
import { isValidUrl } from 'utils/validator';
import emitter, { EVENT_KEYS } from 'utils/event';
import userInfo from 'utils/userInfo';
import PostService from 'services/Post';
import LoadingIndicator from 'components/LoadingIndicator';
import Delete from 'components/Modals/Delete';
import PostForm from 'components/PostForm';
import CommentInfo from 'components/CommentInfo/CommentInfo';


class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      post: props.post,
      preview: (props.post.link_meta && props.post.link_meta.title !== '403 Forbidden') ? props.post.link_meta : null,
      loadingPreview: false,
      showDropdown: false,
      showBookmarkList: false,
      deleteModal: false,
      deleting: false,
      editing: false,
      hideContent: true,
      showComment: false,
      commentCount: props.post.comments_count,
    };
  }

  componentDidMount() {
    if (!this.state.preview && this.state.post.link && isValidUrl(this.state.post.link)) {
      this.fetchPreview();
    }
    window.document.addEventListener('click', (e) => this.hideDropdown(e));
    window.document.addEventListener('click', (e) => this.hideBookmark(e));
  }

  componentWillUnmount() {
    this.handleAlumniSuccessResponse = () => {};
    this.handleAlumniErrorResponse = () => {};
    window.document.removeEventListener('click', (e) => this.hideDropdown(e));
    window.document.removeEventListener('click', (e) => this.hideBookmark(e));
  }

  onToggleDropdown = () => {
    this.setState({ showDropdown: !this.state.showDropdown });
  };

  onToggleBookmark = () => {
    if (this.state.post.bookmarked) {
      this.props.onToggleBookmark(this.state.post.eid);
    } else {
      this.setState({ showBookmarkList: true });
    }
  };

  addBookmark = (postId, bookmarkListId) => {
    this.props.onToggleBookmark(postId, bookmarkListId);
    this.setState({ showBookmarkList: false });
  };

  hideDropdown = (e) => {
    if (this.dropDownToggleRef && !this.dropDownToggleRef.contains(e.target)
        && this.state.showDropdown) {
      this.setState({ showDropdown: false });
    }
  };

  hideBookmark = (e) => {
    if (this.bookmarkListToggleRef && !this.bookmarkListToggleRef.contains(e.target)
        && this.bookmarkListHeaderRef && !this.bookmarkListHeaderRef.contains(e.target)
        && this.state.showBookmarkList) {
      this.setState({ showBookmarkList: false });
    }
  };

  fetchPreview() {
    this.setState({ loadingPreview: true });
    PostService.getPostPreview(this.state.post.eid)
      .then(this.handlePreviewSuccessResponse)
      .catch(this.handlePreviewErrorResponse);
  }

  handleShowComment = () => {
    this.setState({ showComment: !this.state.showComment });
  };

  handleCommentCountChange = (offset) => this.setState({ commentCount: this.state.commentCount + offset });

  handlePreviewSuccessResponse = (res) => {
    if (res && res.data) {
      this.setState({ preview: res.data.title !== '403 Forbidden' ? res.data : {}, loadingPreview: false });
    }
  };

  handlePreviewErrorResponse = () => {
    this.setState({ loadingPreview: false });
  };

  showConfirmDelete = () => this.setState({ deleteModal: true });

  hideConfirmDelete = () => this.setState({ deleteModal: false });

  delete = () => {
    this.setState({ deleting: true });
    PostService.deletePost(this.state.post.eid).then(() => {
      this.props.onDeletePostSuccess(this.state.post.eid);
      toastr.success('Post is deleted.');
    }).catch((e) => {
      if (e.response && e.response.data) {
        toastr.error(e.response.data.detail);
      }
      this.setState({ deleting: false });
    });
  };

  handleEditPostSuccess = (post) => {
    this.setState({
      post,
      preview: post.link_meta,
      editing: false,
      showDropdown: false,
    });
  };

  renderContent() {
    const { content } = this.state.post;
    if (content && content.length > 450) {
      if (this.state.hideContent) {
        return (
          <span className="break-word">
            {`${content.slice(0, 350)}... `}
            <span
              className="pointer text-primary hover-underline"
              onClick={() => this.setState({ hideContent: false })}
            >
              See more
            </span>
          </span>
        );
      }
    }
    return <span className="break-word" dangerouslySetInnerHTML={{ __html: linkify(content) }} />;
  }

  render() {
    const { loadingPreview, preview, post } = this.state;
    // const isAdmin = post.creator && post.creator.groups &&
    //   post.creator.groups.filter(group => group.name === 'admin').length > 0;
    if (this.state.editing) {
      return (
        <div className="mb-3">
          <PostForm
            edit
            isExtended
            onSubmitPostSuccess={this.handleEditPostSuccess}
            cancel={() => this.setState({ editing: false })}
            post={post}
          />
        </div>
      );
    }
    return (
      <div className="post-container border">
        <div className="post-header">
          <div className="text-center float-left vote">
            <i
              className={clsx('fa fa-caret-up fa-2x pointer d-block', { 'text-primary': post.voted })}
              onClick={() => this.props.onTogglePostVote(post.eid)}
            />
            <div className="vote--count">{post.votes || 0}</div>
          </div>
          <div className="text-left float-left">
            {post.categories && post.categories.length > 0
            && (
            <div className="text-xs">
              in
              {' '}
              {post.categories.map((category, index) => (
                <span key={category.id}>
                  {index !== 0 && ', '}
                  <span
                    className={clsx({
                      'font-weight-bold': this.props.currentCategoryFilters.includes(category.slug),
                      'pointer text-primary': this.props.bookmarkFilter === null,
                    })}
                    onClick={() => this.props.bookmarkFilter === null && this.props.addCategory(category.slug)}
                  >
                    {category.name}
                  </span>
                </span>
              ))}
            </div>
            )}
            <div className={clsx('text-xs', { 'mt-2': !post.categories || post.categories.length === 0 })}>
              {`${distanceInWordsToNow(parse(post.created))} ago`}
              {post.editor_ids && post.editor_ids.length > 0
              && ' • Edited by Insight admin'}
            </div>
          </div>
          <div className="post-container--options">
            <i
              ref={(ref) => this.bookmarkListToggleRef = ref}
              className={`fa fa-bookmark${post.bookmarked ? '' : '-o'} fa-lg pointer`}
              onClick={this.onToggleBookmark}
            />
            {((post.creator && post.creator.id === userInfo.getUserId()) || userInfo.isStaff())
              && (
              <i
                ref={(ref) => this.dropDownToggleRef = ref}
                className="fa fa-ellipsis-v fa-lg pointer ml-2"
                onClick={() => this.onToggleDropdown()}
              />
              )}
          </div>
          {this.state.showDropdown
            && (
            <div className="post-container--dropdown">
              <div className="card bg-white">
                <div
                  className="post-container--dropdown--item pointer"
                  onClick={() => this.setState({ editing: true })}
                >
                  Edit
                </div>
              </div>
              <div className="card bg-white">
                <div
                  className="post-container--dropdown--item pointer"
                  onClick={this.showConfirmDelete}
                >
                  Delete
                </div>
              </div>
            </div>
            )}
          {this.state.showBookmarkList
            && (
            <div className="post-container--dropdown text-sm">
              <div className="card bg-default">
                <div
                  ref={(ref) => this.bookmarkListHeaderRef = ref}
                  className="post-container--item-bookmark bg-gray"
                >
                  <b>Add to your bookmark list</b>
                </div>
              </div>
              {this.props.bookmarkLists && this.props.bookmarkLists.map((bookmarkList) => (
                <div
                  key={bookmarkList.id}
                  className="card bg-white"
                  style={{ marginTop: '-1px' }}
                  onClick={() => this.addBookmark(post.eid, bookmarkList.id)}
                >
                  <div className="post-container--item-bookmark pointer">
                    {bookmarkList.title}
                  </div>
                </div>
              ))}
              <div
                className="card bg-white"
                onClick={() => this.props.openCreateBookmarkListModal(post.eid)}
              >
                <div className="post-container--item-bookmark pointer">
                  <i className="fa fa-plus-circle fa-lg mr-2 text-primary" />
                  <b>Create new list</b>
                </div>
              </div>
            </div>
            )}
        </div>
        <div className="post-body">
          {this.renderContent()}
          {post.link
            && (
            <a
              className="link text-sm"
              href={makeFullUrl(post.link)}
              onClick={() => emitter.emit(EVENT_KEYS.VIEW_RESOURCE, {
                link: post.link,
                tags: post.tags && post.tags.map((tag) => tag.name).join(', '),
                categories: post.categories && post.categories.map((category) => category.name).join(', '),
                topic: post.topic,
              })}
              target="_blank"
              rel="noreferrer"
            >
              <div className="preview py-1 px-3 mt-2">
                {loadingPreview
                  ? (
                    <div className="mb-4">
                      <LoadingIndicator />
                    </div>
                  )
                  : ((preview && preview.title)
                    ? (
                      <div>
                        <div className="font-weight-bold mb-1">{preview.title}</div>
                        <div className="text-sm text-secondary mb-2">
                          {(preview.description && preview.description.length > 140)
                            ? `${preview.description.slice(0, 140)}...` : preview.description}
                        </div>
                      </div>
                    )
                    : <span>{post.link.length > 30 ? `${post.link.slice(0, 50)}...` : post.link}</span>
                  )}
              </div>
            </a>
            )}
        </div>
        <div className="post-footer">
          <div className="post-container--tags text-sm">
            tags:
            {' '}
            {post.tags && post.tags.map((tag, index) => (
              <span
                key={tag.id}
                className={clsx({
                  pointer: this.props.bookmarkFilter === null,
                  'font-weight-bold': this.props.currentTagList.includes(tag.name),
                })}
                onClick={() => this.props.bookmarkFilter === null && this.props.addTag({
                  id: uuid(),
                  title: tag.name,
                  value: tag.name,
                  type: 'tag',
                })}
              >
                {tag.name}
                {index + 1 !== post.tags.length && ', '}
              </span>
            ))}
            <div className="ic_comment">
              <span onClick={this.handleShowComment}>
                <i className="fa fa-comment fa-comment-icon" />
                {' '}
                {this.state.commentCount}
              </span>
            </div>
          </div>
        </div>
        {this.state.deleteModal
          && (
          <Delete
            isOpen={this.state.deleteModal}
            close={this.hideConfirmDelete}
            delete={this.delete}
            deleting={this.state.deleting}
            targetType="post"
          />
          )}
        <CommentInfo
          appLabel="posts"
          modelType="post"
          parentId={this.state.post.eid}
          show={this.state.showComment}
          commentCount={this.state.commentCount}
          onCommentCountChange={this.handleCommentCountChange}
        />
      </div>
    );
  }
}

Post.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    created: PropTypes.string,
    creator: PropTypes.objectOf(PropTypes.any),
    editor_ids: PropTypes.arrayOf(PropTypes.number),
    content: PropTypes.string,
    link: PropTypes.string,
    link_meta: PropTypes.objectOf(PropTypes.any),
    votes: PropTypes.number,
    categories: PropTypes.arrayOf(PropTypes.object),
    bookmarked: PropTypes.bool,
    voted: PropTypes.bool,
    tags: PropTypes.arrayOf(PropTypes.object),
    comments_count: PropTypes.number,
  }),
  onToggleBookmark: PropTypes.func,
  currentTagList: PropTypes.arrayOf(PropTypes.string),
  currentCategoryFilters: PropTypes.arrayOf(PropTypes.string),
  addTag: PropTypes.func,
  addCategory: PropTypes.func,
  onDeletePostSuccess: PropTypes.func,
  onTogglePostVote: PropTypes.func,
  bookmarkFilter: PropTypes.number,
  bookmarkLists: PropTypes.arrayOf(PropTypes.object),
  openCreateBookmarkListModal: PropTypes.func,
};

export default Post;
