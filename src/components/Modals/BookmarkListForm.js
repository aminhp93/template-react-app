import React from 'react';
import toastr from 'toastr';
import PropTypes from 'prop-types';
import InputErrorMessage from 'components/InputErrorMessage';
import Modal from 'components/Modal';
import PostService from 'services/Post';

import { Logger } from '@aws-amplify/core'

const logger = new Logger(__filename)

class BookmarkListForm extends React.Component {
  state = {
    bookmarkList: this.props.editing ? this.props.bookmarkList : {},
    errors: {},
  };

  handleFormChange = (e) => {
    this.handleChange(e.target.name, e.target.value);
  };

  handleChange = (name, value) => {
    const bookmarkList = { ...this.state.bookmarkList, [name]: value };
    this.setState({ bookmarkList });
  };

  handleSubmit = () => {
    if (this.validateInput()) return;
    const { bookmarkList } = this.state;
    this.setState({ loading: true });
    if (this.props.editing) {
      PostService.editBookmarkList(bookmarkList.id, bookmarkList).then((res) => {
        toastr.success('List edited successfully!');
        this.setState({ loading: false });
        if (res && res.data) {
          this.props.onEditSuccess(res.data);
        }
      }).catch((e) => {
        this.setState({ loading: false });
        logger.error(e);
      });
    } else {
      PostService.createBookmarkLists(bookmarkList).then((res) => {
        toastr.success('List created successfully!');
        this.setState({ loading: false });
        if (res && res.data) {
          this.props.onCreateSuccess(res.data);
        }
      }).catch((e) => {
        this.setState({ loading: false });
        logger.error(e);
      });
    }
  };

  validateInput = () => {
    const errors = {};
    const { bookmarkList } = this.state;

    if (!bookmarkList.title || bookmarkList.title === '') {
      errors.title = 'Please provide the list title.';
    }

    if (!bookmarkList.description || bookmarkList.description === '') {
      errors.description = 'Please provide the list description.';
    }

    this.setState({ errors });
    return Object.keys(errors).length > 0;
  };

  render() {
    const { bookmarkList, errors } = this.state;
    return (
      <Modal close={this.props.onModalClose}>
        <div id="createProjectModal">
          <div className="text-center mb-1"><b>CREATE NEW BOOKMARK LIST</b></div>
          <div className="form-group">
            <label className="form-control-label">TITLE</label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={bookmarkList.title}
              onChange={this.handleFormChange}
            />
            <span className="text-danger form-required">(*)</span>
            {errors.title && <InputErrorMessage>{errors.title}</InputErrorMessage>}
          </div>
          <div className="form-group">
            <label className="form-control-label">DESCRIPTION</label>
            <input
              type="text"
              name="description"
              className="form-control"
              value={bookmarkList.description}
              onChange={this.handleFormChange}
            />
            <span className="text-danger form-required">(*)</span>
            {errors.description && <InputErrorMessage>{errors.description}</InputErrorMessage>}
          </div>
          <div className="text-center">
            <button
              id="createProjectModalCreateButton"
              className="btn btn-primary my-3 mx-auto"
              onClick={this.handleSubmit}
              disabled={this.state.loading}
            >
              {this.props.editing ? 'UPDATE' : 'CREATE'}
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}

BookmarkListForm.propTypes = {
  onModalClose: PropTypes.func.isRequired,
  bookmarkList: PropTypes.objectOf(PropTypes.any),
  onCreateSuccess: PropTypes.func,
  onEditSuccess: PropTypes.func,
  editing: PropTypes.bool,
};

export default BookmarkListForm;
