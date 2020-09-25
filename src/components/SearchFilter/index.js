import React from 'react';
import PropTypes from 'prop-types';
import emitter, { EVENT_KEYS } from 'utils/event';
import QueryString from 'utils/queryString';
import TagList from './TagList';
import SearchBox from './SearchBox';
// Filters
import SkillFilter from './SkillFilter';
import SessionFilter from './SessionFilter';
import ProgramFilter from './ProgramFilter';
import ProgramLocationFilter from './ProgramLocationFilter';
import PositionFilter from './PositionFilter';
import CompanyFilter from './CompanyFilter';
import LocationFilter from './LocationFilter';

class SearchFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tagList: QueryString.initTagList(props.initialParams) };
    this.handleAddTag = this.handleAddTag.bind(this);
    this.handleRemoveTag = this.handleRemoveTag.bind(this);
    this.handleRemoveAllTags = this.handleRemoveAllTags.bind(this);
  }

  setTagList(tagList) {
    this.setState({ tagList }, () => this.props.fetchAlumni(tagList));
  }

  handleAddTag(item) {
    const tagList = [...this.state.tagList];
    const existedKeywords = tagList.map((tag) => tag.value.toUpperCase());
    if (!existedKeywords.includes(item.value.toUpperCase())) {
      tagList.push(item);
      if (item.type === 'keyword') {
        emitter.emit(EVENT_KEYS.SEARCH_ALUMNI, {
          // Only send keywords typed by users and type of the filters.
          keyword: tagList.filter((tag) => tag.type === 'keyword').map((tag) => tag.value).join(', '),
          filters: [...new Set(tagList.map((tag) => tag.type).filter((type) => type !== 'keyword'))].join(', '),
        });
      } else {
        emitter.emit(EVENT_KEYS.FILTER_ALUMNI, {
          filter: item.type,
          keyword: item.value,
        });
      }
      this.setTagList(tagList);
    }
  }

  handleRemoveTag(item) {
    const tagList = this.state.tagList.filter((tag) => tag.value !== item.value);
    this.setTagList(tagList);
  }

  handleRemoveAllTags() {
    if (this.state.tagList.length > 0) this.setTagList([]);
  }

  render() {
    return (
      <div className="section search-filter">
        <div className="row search">
          <div className="search-icon">
            <i className="fa fa-search fa-lg" />
          </div>
          <div className="search-box">
            <TagList
              tagList={this.state.tagList}
              onRemoveTag={this.handleRemoveTag}
              onRemoveAllTags={this.handleRemoveAllTags}
            />
            <SearchBox onAddTag={this.handleAddTag} />
          </div>
        </div>
        <div className="row filter">
          <SessionFilter onSelect={this.handleAddTag} />
          <SkillFilter onSelect={this.handleAddTag} />
          <ProgramFilter onSelect={this.handleAddTag} />
          <ProgramLocationFilter onSelect={this.handleAddTag} />
          <PositionFilter onSelect={this.handleAddTag} />
          <CompanyFilter onSelect={this.handleAddTag} />
          <LocationFilter onSelect={this.handleAddTag} />
        </div>
      </div>
    );
  }
}

SearchFilter.propTypes = {
  fetchAlumni: PropTypes.func.isRequired,
  // eslint-disable-next-line
  initialParams: PropTypes.object,
};

export default SearchFilter;
