import React from 'react';
import PropTypes from 'prop-types';
import FilterService from 'services/Filter';
import DropDown from 'components/DropDown';

class SessionFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sessions: [],
      search: '',
    };
    this.handleSearch = this.handleSearch.bind(this);
  }

  componentDidMount() {
    this.fetchSessions();
  }

  componentWillUnmount() {
    this.setState = () => {};
  }

  fetchSessions() {
    const params = {};
    if (this.state.search) {
      params.q = this.state.search;
    }
    FilterService.getFilterValues('sessions', params).then((res) => {
      if (res && res.data) {
        this.setState({
          sessions: res.data.map((session) => ({
            id: session.id,
            title: `${session.name} ${session.program.abbr} ${session.location.abbr}`,
            value: `${session.name}.${session.program.abbr}.${session.location.abbr}`,
            type: 'session',
          })),
        });
      }
    });
  }

  handleSearch(search) {
    this.setState({ search }, () => this.fetchSessions());
  }

  render() {
    return (
      <DropDown
        title="Session"
        options={this.state.sessions.slice(0, 5)}
        handleSelect={this.props.onSelect}
        searchable
        onSearch={this.handleSearch}
      />
    );
  }
}

SessionFilter.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default SessionFilter;
