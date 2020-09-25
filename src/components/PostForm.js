import React from 'react';
import clsx from 'clsx';
import toastr from 'toastr';
import PropTypes from 'prop-types';
import TagsInput from 'react-tagsinput';
import Select from 'react-select';
import InputErrorMessage from 'components/InputErrorMessage';
import emitter, { EVENT_KEYS } from 'utils/event';
import { isValidUrl } from 'utils/validator';
import { makeFullUrl } from 'utils/url';
import PostService from 'services/Post';
import { cleanSuffix } from 'utils/string';
import LoadingIndicator from 'components/LoadingIndicator';

import { Logger } from '@aws-amplify/core'

const logger = new Logger(__filename)


const transformPost = (post) => ({
  eid: post.eid,
  content: post.content,
  link: post.link,
  categories: post.categories && post.categories.map((category) => category.slug),
  tags: post.tags && post.tags.map((tag) => tag.name),
});

class PostForm extends React.Component {
  state = {
    post: this.props.post ? transformPost(this.props.post) : {},
    preview: (this.props.post && this.props.post.link_meta) || {},
    loadingPreview: false,
    loading: false,
    error: {},
    categories: this.props.categories || [],
  };

  componentDidMount() {
    if (!this.state.categories || this.state.categories.length < 1) {
      this.fetchCategories();
    }
  }

  componentWillUnmount() {
    this.handleAlumniSuccessResponse = () => {};
    this.handleAlumniErrorResponse = () => {};
  }

  getCategoryNameFromSlug(categorySlug) {
    const category = this.state.categories
      .filter((cate) => cate.slug === categorySlug)[0];
    return category && category.name;
  }

  fetchCategories() {
    PostService.getCategories().then((res) => {
      if (res && res.data && res.data.results) {
        this.setState({ categories: res.data.results });
      }
    });
  }

  handleFormChange = (e) => {
    this.handleChange(e.target.name, e.target.value);
  };

  handleChange = (name, value) => {
    const post = { ...this.state.post };
    post[name] = value;
    if (name === 'link' && isValidUrl(value)) {
      this.fetchPreview(value);
    }
    this.setState({ post });
  };

  fetchPreview(link) {
    this.setState({ loadingPreview: true });
    PostService.getPreview({ url: link })
      .then(this.handlePreviewSuccessResponse)
      .catch(this.handlePreviewErrorResponse);
  }

  handleMultivalueFieldChange = (options) => {
    const post = { ...this.state.post };
    post.categories = options.map((option) => option.value);
    this.setState({ post });
  };

  handlePreviewSuccessResponse = (res) => {
    if (res && res.data) {
      this.setState({ preview: res.data, loadingPreview: false });
    }
  };

  handlePreviewErrorResponse = () => {
    this.setState({ loadingPreview: false, preview: {} });
  };

  validateInput = (post) => {
    const error = {};

    if (!post.content || post.content === '') {
      error.content = 'Please provide the content.';
    }
    if (!post.tags || post.tags.length === 0) {
      error.tags = 'Please provide the tags';
    } else if (post.tags.filter((item) => item.length > 20).length > 0) {
      error.tags = 'Each tag should contain no more than 20 characters.';
    }
    if (!post.link || post.link === '') {
      error.link = 'Please provide the article link';
    } else if (!isValidUrl(post.link)) {
      error.link = 'Please provide a valid url';
    }
    if (!post.categories || post.categories.length === 0) {
      error.categories = 'Please provide the category.';
    }

    this.setState({ error });
    return Object.keys(error).length <= 0;
  };

  handleSubmit = () => {
    if (!this.props.isExtended) this.props.extend();
    if (this.validateInput(this.state.post)) {
      this.setState({ loading: true });
      const data = {
        ...this.state.post,
        link_meta: this.state.preview.title ? this.state.preview : null,
      };
      if (this.props.edit) {
        PostService.editPost(this.state.post.eid, data).then((res) => {
          toastr.success('Edit post successfully!');
          this.setState({ loading: false });
          if (res.data) this.props.onSubmitPostSuccess(res.data);
        }).catch((e) => {
          this.setState({ loading: false });
          logger.error(e);
        });
      } else {
        PostService.createPosts(data).then((res) => {
          emitter.emit(EVENT_KEYS.POST_RESOURCE, {
            link: this.state.post.link,
            tags: this.state.post.tags && this.state.post.tags.join(', '),
            categories: this.state.post.categories.map((slug) => this.getCategoryNameFromSlug(slug)).join(', '),
          });
          toastr.success('Post successfully!');
          this.setState({ post: {}, loading: false });
          if (res.data) this.props.onSubmitPostSuccess(res.data);
        }).catch((e) => {
          this.setState({ loading: false });
          logger.error(e);
        });
      }
    }
  };

  render() {
    const {
      post, error, loadingPreview, preview,
    } = this.state;
    const { isExtended, extend } = this.props;
    return (
      <div className="form post-form">
        <div className="card border">
          <div className={clsx('card-body', { minimized: !isExtended })}>
            <div id="postFormLink" className={clsx('form-group', { minimized: !isExtended })}>
              <i className="fa fa-link fa-lg" />
              <input
                type="text"
                name="link"
                placeholder="Link to article"
                className="form-control"
                value={post.link || ''}
                onChange={this.handleFormChange}
                required
                onFocus={extend}
              />
              {isExtended && error.link && <InputErrorMessage>{error.link}</InputErrorMessage>}
              {isExtended && post.link && isValidUrl(post.link)
                && (
                <div className="bg-white py-1 px-2 mt-2">
                  {loadingPreview
                    ? (
                      <div className="mb-4">
                        <LoadingIndicator />
                      </div>
                    )
                    : ((preview && preview.title)
                      ? (
                        <a
                          className="text-primary text-sm"
                          href={makeFullUrl(post.link)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div>
                            <div className="font-weight-bold mb-1">{preview.title}</div>
                            <div className="text-sm text-secondary mb-2">{preview.description}</div>
                          </div>
                        </a>
                      )
                      : <div>It takes too long to load link preview</div>
                    )}
                </div>
                )}
            </div>
            {isExtended
            && (
              <>
                <div id="postFormCategories" className="form-group">
                  <Select
                    placeholder="Categories"
                    value={post.categories || []}
                    multi
                    name="categories"
                    options={this.state.categories.map((category) => ({
                      value: category.slug,
                      label: category.name,
                    }))}
                    onChange={this.handleMultivalueFieldChange}
                    closeMenuOnSelect={false}
                  />
                  {error.categories && <InputErrorMessage>{error.categories}</InputErrorMessage>}
                </div>
                <div id="postFormTags" className="form-group">
                  <TagsInput
                    value={post.tags || []}
                    onChange={(tags) => this.handleChange('tags', tags && tags.map((tag) => cleanSuffix(tag, ',')))}
                    maxTags={10}
                    onlyUnique
                    addOnBlur
                    addOnPaste
                    addKeys={[9, 13, 188]}
                    inputProps={(post.tags && post.tags.length > 0) ? {
                      placeholder: '',
                      style: { width: 'auto' },
                    } : {
                      placeholder: 'Tags',
                      style: { width: '100%' },
                    }}
                  />
                  <span className="text-secondary form-notice">
                    *Add keywords separated by commas. You can add up to 10 tags per post.
                  </span>
                  {error.tags && <InputErrorMessage>{error.tags}</InputErrorMessage>}
                </div>
                <div id="postFormContent" className="form-group">
                  <textarea
                    type="text"
                    name="content"
                    value={post.content || ''}
                    className="form-control"
                    placeholder="Why is this useful?"
                    onChange={this.handleFormChange}
                  />
                  {error.content && <InputErrorMessage>{error.content}</InputErrorMessage>}
                </div>
              </>
            )}
            {this.props.edit
              ? (
                <>
                  <button
                    id="editFormCancel"
                    className="btn btn-default pull-right"
                    onClick={this.props.cancel}
                  >
                    Cancel
                  </button>
                  <button
                    id="editFormSubmit"
                    className="btn btn-primary pull-right"
                    onClick={this.handleSubmit}
                    disabled={this.state.loading}
                  >
                    Save
                  </button>
                </>
              )
              : (
                <button
                  id="postFormSubmit"
                  className={clsx('btn btn-primary pull-right', { minimized: !isExtended })}
                  onClick={this.handleSubmit}
                  disabled={this.state.loading}
                >
                  Post
                </button>
              )}
          </div>
        </div>
      </div>
    );
  }
}

PostForm.propTypes = {
  post: PropTypes.shape({
    content: PropTypes.string,
    link: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.object),
    tags: PropTypes.arrayOf(PropTypes.object),
    link_meta: PropTypes.objectOf(PropTypes.any),
  }),
  onSubmitPostSuccess: PropTypes.func,
  categories: PropTypes.arrayOf(PropTypes.object),
  isExtended: PropTypes.bool,
  extend: PropTypes.func,
  edit: PropTypes.bool,
  cancel: PropTypes.func,
};

export default PostForm;
