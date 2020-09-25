import React from 'react';
import PropTypes from 'prop-types';
import FilterService from 'services/Filter';
import DropDown from 'components/DropDown';

class PositionFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      positions: [],
      search: '',
    };
    this.fetchPositions = this.fetchPositions.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  componentDidMount() {
    this.fetchPositions();
  }

  componentWillUnmount() {
    this.setState = () => {};
  }

  fetchPositions() {
    const params = {};
    if (this.state.search) {
      params.q = this.state.search;
    }
    FilterService.getFilterValues('positions', params).then((res) => {
      if (res && res.data) {
        this.setState({
          positions: res.data.map((position, index) => ({
            id: index,
            title: position.position,
            value: position.position,
            count: position.count,
            type: 'position',
          })),
        });
      }
    });
  }

  handleSearch(search) {
    this.setState({ search }, () => this.fetchPositions());
  }

  render() {
    return (
      <DropDown
        title="Position"
        options={this.state.positions}
        handleSelect={this.props.onSelect}
        searchable
        onSearch={this.handleSearch}
      />
    );
  }
}

PositionFilter.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default PositionFilter;
