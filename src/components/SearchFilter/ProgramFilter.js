import React from 'react';
import PropTypes from 'prop-types';
import FilterService from 'services/Filter';
import DropDown from 'components/DropDown';

class ProgramFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      programs: [],
    };
  }

  componentDidMount() {
    this.fetchPrograms();
  }

  componentWillUnmount() {
    this.setState = () => {};
  }

  fetchPrograms() {
    FilterService.getFilterValues('programs').then((res) => {
      if (res && res.data) {
        this.setState({
          programs: res.data.results.map((program) => ({
            id: program.id,
            title: program.name,
            value: program.abbr,
            type: 'program',
          })),
        });
      }
    });
  }

  render() {
    return (
      <DropDown
        title="Program"
        options={this.state.programs}
        handleSelect={this.props.onSelect}
      />
    );
  }
}

ProgramFilter.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default ProgramFilter;
