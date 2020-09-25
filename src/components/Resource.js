import React from 'react';
import PostForm from 'components/PostForm';
import PostList from 'components/PostList';
import LoadingIndicator from 'components/LoadingIndicator';
import TagList from 'components/SearchFilter/TagList';
import SearchBox from 'components/SearchFilter/SearchBox';
import ResourceBookmarks from 'components/ResourceBookmarks';
import ResourceCategories from 'components/ResourceCategories';
import ResourceTopics from 'components/ResourceTopics';
import BookmarkListForm from 'components/Modals/BookmarkListForm';
import BookmarkListInfo from 'components/BookmarkListInfo';
import emitter, { EVENT_KEYS } from 'utils/event';
import PostService from 'services/Post';
import history from 'utils/history';
import makePageTitle from 'utils/common';
import QueryString from 'utils/queryString';

import { Logger } from '@aws-amplify/core'

const logger = new Logger(__filename)

const toArray = (stringOrArray) => {
  if (!stringOrArray) return [];
  if (stringOrArray instanceof Array) return stringOrArray;
  return [stringOrArray];
};

class Resource extends React.Component {
  constructor(props) {
    super(props);
    const { search } = history.location;
    const currentParams = search ? QueryString.parse(search) : {};
    this.state = {
      posts: [],
      tags: QueryString.initTagList({
        tag: currentParams.tags,
        keyword: currentParams.keywords,
      }),
      bookmarkFilter: currentParams.bookmarkListId
        ? parseInt(currentParams.bookmarkListId, 10) : null,
      fetching: false,
      page: 1,
      end: false,
      categories: [],
      categoryFilters: toArray(currentParams.categories),
      topics: [],
      bookmarkLists: [],
      bookmarkListForm: false,
      topicFilter: currentParams.topic || null,
      formExtended: false,
      totalResults: null,
      postIdToBookmark: null,
      showBookmarkLists: currentParams.showBookmarkLists === 'true',
    };
  }

  componentDidMount() {
    document.title = makePageTitle('Resources Directory');
    if (!this.state.showBookmarkLists) {
      if (this.state.bookmarkFilter) this.fetchBookmarks();
      else this.fetchPosts();
    }
    this.fetchCategories();
    this.fetchTopics();
    this.fetchBookmarkLists();
    window.addEventListener('scroll', this.checkScrollFetchMore);
    window.document.addEventListener('click', (e) => this.checkFormBlurred(e));
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.checkScrollFetchMore);
    window.document.removeEventListener('click', (e) => this.checkFormBlurred(e));
  }

  getCategoryNameFromSlug(categorySlug) {
    const category = this.state.categories
      .filter((cate) => cate.slug === categorySlug)[0];
    return category && category.name;
  }

  getTopicNameFromSlug(topicSlug) {
    const topic = this.state.topics.filter((t) => t.slug === topicSlug)[0];
    return topic && topic.name;
  }

  checkFormBlurred = (e) => {
    if (this.formRef && !this.formRef.contains(e.target)) this.minimizeForm();
  };

  fetchPosts = (reset) => {
    const params = {
      page: reset ? 1 : this.state.page,
    };
    if (params.page > 1) {
      emitter.emit(EVENT_KEYS.BROWSE_RESOURCE_DIRECTORY, {
        topic: this.getTopicNameFromSlug(this.state.topicFilter),
        categories: this.state.categoryFilters.map((slug) => this.getCategoryNameFromSlug(slug)).join(', '),
      });
    }
    if (reset) this.setState({ page: 1, posts: [] });
    this.setState({ fetching: true });
    const { tags, categoryFilters, topicFilter } = this.state;
    PostService.getPosts(params, tags, categoryFilters, topicFilter).then((res) => {
      // Check filters to prevent other fetching requests haven't finished
      const isLastRequest = tags === this.state.tags
        && categoryFilters === this.state.categoryFilters
        && topicFilter === this.state.topicFilter;
      if (res && res.data && isLastRequest) {
        this.setState({
          posts: reset ? res.data.results : [...this.state.posts, ...res.data.results],
          end: res.data.next === null,
          fetching: false,
          totalResults: res.data.count,
        });
      }
    }).catch((e) => {
      this.setState({ fetching: false, totalResults: null, end: true });
      logger.error(e);
    });
  };

  fetchBookmarks(reset) {
    const params = {
      page: reset ? 1 : this.state.page,
    };
    if (reset) this.setState({ page: 1, posts: [] });
    this.setState({ fetching: true });
    const { bookmarkFilter } = this.state;
    PostService.getMyBookmarks(params, bookmarkFilter).then((res) => {
      const isLastRequest = bookmarkFilter === this.state.bookmarkFilter;
      if (res && res.data && isLastRequest) {
        this.setState({
          posts: reset ? res.data.results : [...this.state.posts, ...res.data.results],
          end: res.data.next === null,
          fetching: false,
          totalResults: res.data.count,
        });
      }
    }).catch((e) => {
      this.setState({ fetching: false, totalResults: null, end: true });
      logger.error(e);
    });
  }

  fetchCategories() {
    PostService.getCategories().then((res) => {
      if (res && res.data && res.data.results) {
        this.setState({ categories: res.data.results });
      }
    });
  }

  fetchTopics() {
    PostService.getTopics().then((res) => {
      if (res && res.data && res.data.results) {
        this.setState({ topics: res.data.results });
      }
    });
  }

  fetchBookmarkLists() {
    PostService.getBookmarkLists().then((res) => {
      if (res && res.data && res.data.results) {
        this.setState({ bookmarkLists: res.data.results });
      }
    });
  }

  minimizeForm = () => this.setState({ formExtended: false });

  extendForm = () => this.setState({ formExtended: true });

  handleTagListChange = (tags, type) => {
    this.setState({ tags }, () => (this.state.bookmarkFilter === null ? this.fetchPosts(true) : this.fetchBookmarks(true)));
    if (tags && tags.length > 0) {
      // Support analytics
      if (type === 'keyword') {
        emitter.emit(
          EVENT_KEYS.RESOURCE_FUZZY_SEARCH,
          {
            keywords: tags && tags.filter((tag) => tag.type === 'keyword').map((tag) => tag.title).join(', '),
            tags: tags && tags.filter((tag) => tag.type === 'tag').map((tag) => tag.title).join(', '),
            topic: this.getTopicNameFromSlug(this.state.topicFilter),
            categories: this.state.categoryFilters.map((slug) => this.getCategoryNameFromSlug(slug)).join(', '),
          },
        );
      } else {
        emitter.emit(
          EVENT_KEYS.SEARCH_RESOURCE_TAGS,
          { tags: tags && tags.filter((tag) => tag.type === 'tag').map((tag) => tag.title).join(', ') },
        );
      }
    }
  };

  handleAddTag = (item, type) => {
    const tags = [...this.state.tags];
    const existedKeywords = tags.map((tag) => tag.title.toUpperCase());
    if (!existedKeywords.includes(item.title.toUpperCase())) {
      tags.push(item);
      this.handleTagListChange(tags, type);
    }
  };

  handleRemoveTag = (item) => {
    const tags = this.state.tags.filter((tag) => tag.title !== item.title);
    this.handleTagListChange(tags);
  };

  handleRemoveAllTags = () => {
    if (this.state.tags.length > 0) this.handleTagListChange([]);
  };

  changeBookmarkList = (bookmarkListId) => {
    this.setState({
      showBookmarkLists: false,
      bookmarkFilter: bookmarkListId === this.state.bookmarkFilter ? null : bookmarkListId,
    }, () => {
      if (this.state.bookmarkFilter === null) {
        this.fetchPosts(true);
      } else {
        this.setState({
          categoryFilters: [],
          topicFilter: null,
          tags: [],
        }, () => this.fetchBookmarks(true));
      }
    });
  };

  togglePostBookmark = (postId, bookmarkListId) => {
    PostService.bookmark({ post_id: postId, bookmark_list_id: bookmarkListId }).then(() => {
      if (this.state.bookmarkFilter !== null) {
        this.fetchBookmarks(true);
        this.fetchBookmarkLists();
      } else {
        this.setState({
          posts: this.state.posts.map((post) => {
            const updatedPost = post;
            if (post.eid === postId) {
              updatedPost.bookmarked = !updatedPost.bookmarked;
              if (updatedPost.bookmarked) {
                emitter.emit(EVENT_KEYS.BOOKMARK_RESOURCE, {
                  link: post.link,
                  tags: post.tags && post.tags.map((tag) => tag.name).join(', '),
                  categories: post.categories.map((category) => category.name).join(', '),
                });
              }
            }
            return post;
          }),
          postIdToBookmark: null,
        });
      }
      // Update post count in bookmarklist
      this.fetchBookmarkLists();
    });
  };

  togglePostVote = (postId) => {
    PostService.vote({ post_id: postId }).then(() => {
      this.setState({
        posts: this.state.posts.map((post) => {
          const updatedPost = post;
          if (post.eid === postId) {
            updatedPost.voted = !updatedPost.voted;
            if (updatedPost.voted) {
              updatedPost.votes += 1;
            } else {
              updatedPost.votes -= 1;
            }
          }
          return post;
        }),
      });
    });
  };

  handleCategoryFilterChange = (categoryFilters) => {
    this.setState({ categoryFilters }, () => this.fetchPosts(true));
  };

  toggleCategory = (categorySlug) => {
    let categoryFilters = [...this.state.categoryFilters];
    if (categoryFilters.includes(categorySlug)) {
      categoryFilters = categoryFilters.filter((filter) => filter !== categorySlug);
    } else {
      categoryFilters.push(categorySlug);
      const categoryName = this.getCategoryNameFromSlug(categorySlug);
      if (categoryName) {
        emitter.emit(EVENT_KEYS.SEARCH_RESOURCE_CATEGORIES, {
          category: categoryName,
        });
      }
    }
    this.handleCategoryFilterChange(categoryFilters);
  };

  handleAddCategory = (categorySlug) => {
    const categoryFilters = [...this.state.categoryFilters];
    if (!categoryFilters.includes(categorySlug)) {
      categoryFilters.push(categorySlug);
      this.handleCategoryFilterChange(categoryFilters);
      const categoryName = this.getCategoryNameFromSlug(categorySlug);
      if (categoryName) {
        emitter.emit(EVENT_KEYS.SEARCH_RESOURCE_CATEGORIES, {
          category: categoryName,
        });
      }
    }
  };

  handleChangeTopic = (newTopicFilter) => {
    let topicFilter;
    if (newTopicFilter === this.state.topicFilter) {
      topicFilter = null;
    } else {
      topicFilter = newTopicFilter;
      const topicName = this.getTopicNameFromSlug(newTopicFilter);
      emitter.emit(EVENT_KEYS.SEARCH_RESOURCE_TOPIC, {
        topic: topicName,
      });
    }
    this.setState({ topicFilter }, () => this.fetchPosts(true));
  };

  fetchMore() {
    if (!this.state.fetching && !this.state.end) {
      this.setState({
        page: this.state.page + 1,
      }, () => (this.state.bookmarkFilter !== null ? this.fetchBookmarks() : this.fetchPosts()));
    }
  }

  checkScrollFetchMore = () => {
    if (window.innerHeight + window.scrollY
        > document.getElementsByClassName('main-page')[0].clientHeight - 200) {
      this.fetchMore();
    }
  };

  handleOpenCreateBookmarkListModal = (postId) => {
    if (postId) {
      this.setState({ bookmarkListForm: true, postIdToBookmark: postId });
    } else {
      this.setState({ bookmarkListForm: true });
    }
  };

  handleCreatePostSuccess = (newPost) => {
    this.setState({
      posts: [newPost, ...this.state.posts],
      formExtended: false,
      totalResults: this.state.totalResults + 1,
    });
  };

  handleDeletePostSuccess = (postId) => {
    this.setState({
      posts: this.state.posts.filter((post) => post.eid !== postId),
      totalResults: this.state.totalResults - 1,
    });
  };

  handleToggleShowingBookmarkList = () => {
    this.setState({ showBookmarkLists: !this.state.showBookmarkLists }, () => {
      if (this.state.showBookmarkLists) {
        // Update urls for sharing purposes
        QueryString.updateUrlWithParams({ showBookmarkLists: true });
        this.setState({ bookmarkFilter: null });
      } else this.fetchPosts(true);
    });
  };

  handleCreateBookmarkListSuccess = (newBookmarkList) => {
    this.setState({
      bookmarkLists: [...this.state.bookmarkLists, newBookmarkList],
      bookmarkListForm: false,
    }, () => {
      if (this.state.postIdToBookmark) {
        this.togglePostBookmark(this.state.postIdToBookmark, newBookmarkList.id);
      }
    });
  };

  handleUpdateBookmarkListSuccess = (updatedBookmarkList) => {
    this.setState({
      bookmarkLists: this.state.bookmarkLists.map((bookmarkList) => {
        if (updatedBookmarkList.id === bookmarkList.id) {
          return updatedBookmarkList;
        }
        return bookmarkList;
      }),
    });
  };

  handleDeleteBookmarkListSuccess = (bookmarkListId) => {
    this.setState({
      bookmarkLists:
        this.state.bookmarkLists
          .filter((bookmarkList) => bookmarkList.id !== bookmarkListId),
      bookmarkFilter: null,
    }, () => {
      if (!this.state.showBookmarkLists) this.fetchPosts(true);
    });
  };

  renderBookmarkLists = () => ((this.state.bookmarkLists && this.state.bookmarkLists.length > 0)
    ? this.state.bookmarkLists.map((bookmarkList) => (
      <BookmarkListInfo
        key={bookmarkList.id}
        bookmarkList={bookmarkList}
        onDeleteSuccess={this.handleDeleteBookmarkListSuccess}
        onEditSuccess={this.handleUpdateBookmarkListSuccess}
        changeBookmarkList={this.changeBookmarkList}
      />
    ))
    : <div className="ml-4">You don’t have any bookmark lists yet.</div>);

  renderPosts = (bookmarkFiltering, currentBookmarkList) => {
    const currentTopic = this.state.topicFilter && this.state.topics.length > 0
      && this.state.topics.filter((topic) => topic.slug === this.state.topicFilter)[0];
    const currentCategories = this.state.categoryFilters && this.state.categoryFilters.length > 0
      && this.state.categories.filter((category) => this.state.categoryFilters.includes(category.slug));
    return (
      <>
        {bookmarkFiltering && currentBookmarkList
          ? (
            <BookmarkListInfo
              bookmarkList={currentBookmarkList}
              onDeleteSuccess={this.handleDeleteBookmarkListSuccess}
              onEditSuccess={this.handleUpdateBookmarkListSuccess}
            />
          )
          : (
            <>
              <div ref={(ref) => this.formRef = ref}>
                <PostForm
                  onSubmitPostSuccess={this.handleCreatePostSuccess}
                  categories={this.state.categories}
                  isExtended={this.state.formExtended}
                  extend={this.extendForm}
                />
              </div>
              <div className="section search-filter mt-2 border">
                <div className="search">
                  <div className="search-icon">
                    <i className="fa fa-search fa-lg" />
                  </div>
                  <div className="search-box">
                    <TagList
                      tagList={this.state.tags}
                      onRemoveTag={this.handleRemoveTag}
                      onRemoveAllTags={this.handleRemoveAllTags}
                    />
                    {/* Type is added as a param to support analytics */}
                    <SearchBox onAddTag={(item) => this.handleAddTag(item, 'keyword')} />
                  </div>
                </div>
              </div>
            </>
          )}
        {!bookmarkFiltering && !this.state.fetching && !!this.state.totalResults
          && (
          <div className="post-result-count">
            {this.state.totalResults}
            {' '}
            results
            {currentTopic && (
            <span>
              {' '}
              from topic
              <b>{currentTopic.name}</b>
            </span>
            )}
            {currentCategories && currentCategories.length > 0
              && (currentTopic
                ? currentCategories.map((category) => (
                  <span key={category.slug}>
                    , category
                    <b>{category.name}</b>
                  </span>
                ))
                : (
                  <span>
                    {' '}
                    from
                    {currentCategories.map((category, idx) => (
                      <span key={category.slug}>
                        {' '}
                        category
                        <b>{category.name}</b>
                        {' '}
                        {idx < currentCategories.length - 1 && ','}
                      </span>
                    ))}
                  </span>
                )
              )}
          </div>
          )}
        {this.state.posts.length > 0
          ? (
            <PostList
              posts={this.state.posts}
              addTag={(item) => this.handleAddTag(item, 'tag')}
              addCategory={this.handleAddCategory}
              onToggleBookmark={this.togglePostBookmark}
              onTogglePostVote={this.togglePostVote}
              currentTagList={this.state.tags
              && this.state.tags.filter((tag) => tag.type === 'tag').map((tag) => tag.title)}
              currentCategoryFilters={this.state.categoryFilters}
              onDeletePostSuccess={this.handleDeletePostSuccess}
              bookmarkFilter={this.state.bookmarkFilter}
              bookmarkLists={this.state.bookmarkLists}
              openCreateBookmarkListModal={this.handleOpenCreateBookmarkListModal}
            />
          )
          : !this.state.fetching
            && (
            <div className="ml-4">
              {this.state.bookmarkFilter !== null
                ? 'You don’t have any bookmarked articles yet. Go to Resources directory and start exploring.'
                : 'No result matches your search.'}
            </div>
            )}
        {this.state.fetching && <LoadingIndicator />}
        {this.state.posts && this.state.posts.length > 0
          && (
          <button className="back-to-top pointer" onClick={() => window.scrollTo(0, 0)}>
            <i className="fa fa-chevron-up" />
            <span>TOP</span>
          </button>
          )}
      </>
    );
  };

  render() {
    const { showBookmarkLists } = this.state;
    const bookmarkFiltering = this.state.bookmarkFilter !== null;
    const currentBookmarkList = bookmarkFiltering
      && this.state.bookmarkLists
        .filter((bookmarkList) => bookmarkList.id === this.state.bookmarkFilter)[0];
    return (
      <div className="row py-5">
        <div className="col-md-4 mb-2">
          <ResourceBookmarks
            bookmarkFilter={this.state.bookmarkFilter}
            bookmarkLists={this.state.bookmarkLists}
            changeBookmarkList={this.changeBookmarkList}
            openCreateBookmarkListModal={this.handleOpenCreateBookmarkListModal}
            showBookmarkLists={this.state.showBookmarkLists}
            onToggleShowingBookmarkList={this.handleToggleShowingBookmarkList}
          />
          {!bookmarkFiltering && !showBookmarkLists
            && (
              <>
                <ResourceCategories
                  categoryFilters={this.state.categoryFilters}
                  categories={this.state.categories}
                  handleCategoryFilterChange={this.handleCategoryFilterChange}
                  toggleCategory={this.toggleCategory}
                />
                <ResourceTopics
                  topics={this.state.topics}
                  topicFilter={this.state.topicFilter}
                  handleChangeTopic={this.handleChangeTopic}
                />
              </>
            )}
        </div>
        <div className="col-md-8">
          {(this.state.showBookmarkLists || bookmarkFiltering)
            && (
            <div className="back-to-link" onClick={() => this.changeBookmarkList(null)}>
              <i className="fa fa-arrow-left mr-2" />
              Back to resource directory
            </div>
            )}
          {/* TODO: move bookmarkList to a new route when having handled the url params */}
          {this.state.showBookmarkLists
            ? this.renderBookmarkLists()
            : this.renderPosts(bookmarkFiltering, currentBookmarkList)}
        </div>
        {this.state.bookmarkListForm
          && (
          <BookmarkListForm
            onModalClose={() => this.setState({ bookmarkListForm: false })}
            onCreateSuccess={this.handleCreateBookmarkListSuccess}
          />
          )}
      </div>
    );
  }
}

export default Resource;
