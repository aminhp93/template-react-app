import React from 'react';
import toastr from 'toastr';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { makeFullUrl } from 'utils/url';
import { makeExcerpt } from 'utils/string';
import { isValidUrl } from 'utils/validator';
import emitter, { EVENT_KEYS } from 'utils/event';
import userInfo from 'utils/userInfo';
import PostService from 'services/Post';
import LoadingIndicator from 'components/LoadingIndicator';
import Delete from 'components/Modals/Delete';
import PostForm from 'components/PostForm';


class DatasetPost extends React.Component {
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

  render() {
    const { loadingPreview, preview, post } = this.state;
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
    const dataset = post.reference_object;
    return (
      <div className="post-container border">
        <div className="post-header">
          <div className="mt-1 ml-3 font-weight-bold text-lg">{dataset.name}</div>
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
          <div className="mt-3 ml-3 text-sm">
            {(dataset && dataset.projects && dataset.projects.length > 0)
              ? (
                <>
                  <div className="font-weight-bold mb-3">Used in project(s)</div>
                  <ul className="mt-1 pl-0" style={{ listStyle: 'square' }}>
                    {dataset.projects.map((project, idx) => (
                      <li className="mb-2" key={project.id}>
                        <Link
                          className="link"
                          to={`/projects/${project.slug}`}
                          target="_blank"
                          onClick={() => emitter.emit(EVENT_KEYS.VIEW_PROJECT_FROM_DATASET, {
                            project_name: project.title,
                            dataset_name: dataset.name,
                            categories: post.categories && post.categories.map((category) => category.name).join(', '),
                          })}
                        >
                          <b>{project.title}</b>
                        </Link>
                        <div>{makeExcerpt(project.description, 75)}</div>
                        {idx !== dataset.projects.length - 1 && <hr />}
                      </li>
                    ))}
                  </ul>
                </>
              )
              : <div className="font-weight-bold my-3">Not used in any project</div>}
          </div>
        </div>
        <div className="post-footer">
          {/* <div className="post-container--tags text-sm">
            tags: {post.tags && post.tags.map((tag, index) => (
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
                {tag.name}{index + 1 !== post.tags.length && ', '}
              </span>
            ))}
          </div> */}
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
      </div>
    );
  }
}

DatasetPost.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    content: PropTypes.string,
    link: PropTypes.string,
    link_meta: PropTypes.objectOf(PropTypes.any),
    bookmarked: PropTypes.bool,
    tags: PropTypes.arrayOf(PropTypes.object),
    categories: PropTypes.arrayOf(PropTypes.object),
    reference_objects: PropTypes.objectOf(PropTypes.any),
  }),
  onToggleBookmark: PropTypes.func,
  // currentTagList: PropTypes.arrayOf(PropTypes.string),
  // addTag: PropTypes.func,
  onDeletePostSuccess: PropTypes.func,
  // bookmarkFilter: PropTypes.number,
  bookmarkLists: PropTypes.arrayOf(PropTypes.object),
  openCreateBookmarkListModal: PropTypes.func,
};

export default DatasetPost;
