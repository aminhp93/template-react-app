import React from 'react';
import PropTypes from 'prop-types';
import FilterService from 'services/Filter';
import DropDown from 'components/DropDown';

class LocationFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: [],
    };
    this.handleSearch = this.handleSearch.bind(this);
  }

  componentDidMount() {
    this.fetchLocations();
  }

  componentWillUnmount() {
    this.setState = () => {};
  }

  fetchLocations() {
    const params = {};
    if (this.state.search) {
      params.q = this.state.search;
    }
    FilterService.getFilterValues('currentLocations', params).then((res) => {
      if (res && res.data) {
        this.setState({
          locations: res.data.map((location, index) => ({
            id: index,
            title: location.current_location,
            value: location.current_location,
            count: location.count,
            type: 'current_location',
          })),
        });
      }
    });
  }

  handleSearch(search) {
    this.setState({ search }, () => this.fetchLocations());
  }

  render() {
    return (
      <DropDown
        title="Current location"
        options={this.state.locations}
        handleSelect={this.props.onSelect}
        searchable
        onSearch={this.handleSearch}
      />
    );
  }
}

LocationFilter.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default LocationFilter;
