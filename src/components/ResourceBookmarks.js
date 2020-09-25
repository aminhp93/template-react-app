import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const ResourceBookmarks = (props) => (
  <>
    <div
      className={clsx('sidebar-button menu pointer', { active: props.showBookmarkLists })}
      onClick={props.onToggleShowingBookmarkList}
    >
      <i className="fa fa-bookmark-o fa-lg mr-2" />
      MY BOOKMARKS
    </div>
    {props.bookmarkLists.length > 0 && props.bookmarkLists.map((bookmarkList) => (
      <div
        key={bookmarkList.id}
        className={clsx(
          'sidebar-filter-item pointer',
          { active: props.bookmarkFilter === bookmarkList.id },
        )}
        onClick={() => props.changeBookmarkList(bookmarkList.id)}
      >
        {bookmarkList.title}
        {props.bookmarkFilter === bookmarkList.id
          && <i className="fa fa-check pull-right mr-2 mt-1" />}
      </div>
    ))}
    {(props.bookmarkFilter !== null || props.showBookmarkLists)
      && (
      <div
        className="sidebar-button pointer"
        onClick={() => props.openCreateBookmarkListModal()}
      >
        <i className="fa fa-plus-circle fa-lg mx-2 text-primary" />
        Create new list
      </div>
      )}
  </>
);

ResourceBookmarks.propTypes = {
  bookmarkFilter: PropTypes.number,
  bookmarkLists: PropTypes.arrayOf(PropTypes.object),
  openCreateBookmarkListModal: PropTypes.func,
  showBookmarkLists: PropTypes.bool,
  onToggleShowingBookmarkList: PropTypes.func,
};

export default ResourceBookmarks;
