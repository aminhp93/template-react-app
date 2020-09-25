import React from 'react';
import PropTypes from 'prop-types';
import Post from 'components/PostList/Post';
import DatasetPost from 'components/PostList/DatasetPost';

const PostList = (props) => {
  const postList = props.posts && props.posts.map((post) => {
    if (post.reference_type === 'dataset') {
      return (
        <DatasetPost
          key={post.eid}
          post={post}
          onToggleBookmark={props.onToggleBookmark}
          addTag={props.addTag}
          currentTagList={props.currentTagList}
          onDeletePostSuccess={props.onDeletePostSuccess}
          bookmarkFilter={props.bookmarkFilter}
          bookmarkLists={props.bookmarkLists}
          openCreateBookmarkListModal={props.openCreateBookmarkListModal}
        />
      );
    }
    return (
      <Post
        key={post.eid}
        post={post}
        onToggleBookmark={props.onToggleBookmark}
        onTogglePostVote={props.onTogglePostVote}
        addTag={props.addTag}
        addCategory={props.addCategory}
        currentTagList={props.currentTagList}
        currentCategoryFilters={props.currentCategoryFilters}
        onDeletePostSuccess={props.onDeletePostSuccess}
        bookmarkFilter={props.bookmarkFilter}
        bookmarkLists={props.bookmarkLists}
        openCreateBookmarkListModal={props.openCreateBookmarkListModal}
      />
    );
  });
  return (
    <div className="mb-3">
      {postList}
    </div>
  );
};

PostList.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.object),
  onToggleBookmark: PropTypes.func,
  addTag: PropTypes.func,
  addCategory: PropTypes.func,
  currentTagList: PropTypes.arrayOf(PropTypes.string),
  currentCategoryFilters: PropTypes.arrayOf(PropTypes.string),
  onDeletePostSuccess: PropTypes.func,
  onTogglePostVote: PropTypes.func,
  bookmarkFilter: PropTypes.number,
  bookmarkLists: PropTypes.arrayOf(PropTypes.object),
  openCreateBookmarkListModal: PropTypes.func,
};

export default PostList;
