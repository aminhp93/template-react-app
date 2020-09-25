import React from 'react';
import PropTypes from 'prop-types';
import toastr from 'toastr';
import { Logger } from '@aws-amplify/core'
import { distanceInWordsToNow, parse } from 'date-fns';
import PostService from 'services/Post';
import BookmarkListForm from 'components/Modals/BookmarkListForm';
import Delete from 'components/Modals/Delete';


const logger = new Logger(__filename)


class BookmarkListInfo extends React.Component {
  state = {
    bookmarkListForm: false,
    deleting: false,
    deleteBookmarkListModal: false,
  };

  onEditSuccess = (updatedBookmarkList) => {
    this.setState({ bookmarkListForm: false });
    this.props.onEditSuccess(updatedBookmarkList);
  };

  deleteBookmarkList = () => {
    this.setState({ deleting: true });
    PostService.deleteBookmarkList(this.props.bookmarkList.id).then(() => {
      toastr.success('List deleted successfully!');
      this.setState({
        deleting: false,
        deleteBookmarkListModal: false,
      });
      this.props.onDeleteSuccess(this.props.bookmarkList.id);
    }).catch((e) => {
      this.setState({ deleting: false });
      logger.error(e)
    });
  };

  render() {
    const { bookmarkList } = this.props;
    return (
      <div className="bookmark-list-info bg-white px-5 py-2 mb-3 border">
        <div className="mb-1"><b>{bookmarkList.title}</b></div>
        <div className="text-sm">
          {`${distanceInWordsToNow(parse(bookmarkList.modified))} ago ● ${bookmarkList.post_count} posts`}
          {' '}
          <br />
          {bookmarkList.description}
        </div>
        {this.props.changeBookmarkList
          && (
          <div className="show-post-link">
            <span className="link" onClick={() => this.props.changeBookmarkList(bookmarkList.id)}>Show posts</span>
          </div>
          )}
        <div className="bookmark-list-info--action-icon">
          <i
            className="fa fa-edit fa-lg pointer mt-1 mr-2"
            onClick={() => this.setState({
              bookmarkListForm: true,
            })}
          />
          <i
            className="fa fa-trash fa-lg pointer"
            onClick={() => this.setState({ deleteBookmarkListModal: true })}
          />
        </div>
        {this.state.bookmarkListForm
          && (
          <BookmarkListForm
            onModalClose={() => this.setState({ bookmarkListForm: false })}
            onEditSuccess={this.onEditSuccess}
            bookmarkList={bookmarkList}
            editing
          />
          )}
        {this.state.deleteBookmarkListModal
          && (
          <Delete
            isOpen={this.state.deleteBookmarkListModal}
            close={() => this.setState({ deleteBookmarkListModal: false })}
            delete={this.deleteBookmarkList}
            deleting={this.state.deleting}
            targetType="bookmark list"
          />
          )}
      </div>
    );
  }
}

BookmarkListInfo.propTypes = {
  bookmarkList: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    modified: PropTypes.string,
    description: PropTypes.string,
    post_count: PropTypes.number,
  }),
  onEditSuccess: PropTypes.func,
  onDeleteSuccess: PropTypes.func,
  changeBookmarkList: PropTypes.func,
};

export default BookmarkListInfo;
