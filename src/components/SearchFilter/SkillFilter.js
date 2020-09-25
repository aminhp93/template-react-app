import React from 'react';
import PropTypes from 'prop-types';
import FilterService from 'services/Filter';
import DropDown from 'components/DropDown';

class SkillFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      skills: [],
      search: '',
    };
    this.handleSearch = this.handleSearch.bind(this);
  }

  componentDidMount() {
    this.fetchSkills();
  }

  componentWillUnmount() {
    this.setState = () => {};
  }

  fetchSkills() {
    const params = {};
    if (this.state.search) {
      params.keyword = this.state.search;
    }
    FilterService.getFilterValues('skills', params).then((res) => {
      if (res && res.data) {
        this.setState({
          skills: res.data.map((skill) => ({
            id: skill.id,
            title: `${skill.name}`,
            value: `${skill.name}`,
            type: 'skills',
          })),
        });
      }
    });
  }

  handleSearch(search) {
    this.setState({ search }, () => this.fetchSkills());
  }

  render() {
    return (
      <DropDown
        title="Skill"
        options={this.state.skills.slice(0, 10)}
        handleSelect={this.props.onSelect}
        searchable
        onSearch={this.handleSearch}
      />
    );
  }
}

SkillFilter.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default SkillFilter;
