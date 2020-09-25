import React from 'react';
import PropTypes from 'prop-types';
import FilterService from 'services/Filter';
import DropDown from 'components/DropDown';

class ProgramLocationFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: [],
    };
  }

  componentDidMount() {
    this.fetchLocations();
  }

  componentWillUnmount() {
    this.setState = () => {};
  }

  fetchLocations() {
    FilterService.getFilterValues('locations').then((res) => {
      if (res && res.data) {
        this.setState({
          locations: res.data.results.map((location) => ({
            id: location.id,
            title: location.address,
            value: location.abbr,
            type: 'location',
          })),
        });
      }
    });
  }

  render() {
    return (
      <DropDown
        title="Program Location"
        options={this.state.locations}
        handleSelect={this.props.onSelect}
      />
    );
  }
}

ProgramLocationFilter.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default ProgramLocationFilter;
