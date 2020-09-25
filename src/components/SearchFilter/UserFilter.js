import React from 'react';
import PropTypes from 'prop-types';
import AlumniService from 'services/Alumni';
import DropDown from 'components/DropDown';
import { ConsoleLogger as Logger } from '@aws-amplify/core';


const logger = new Logger('UserFilter');
class UserFilter extends React.Component {
  static propTypes = {
    handleSelect: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      alumni: [],
      search: '',
    };
  }

  fetchSessions() {
    const params = {
      page: 1,
    };
    const extraParams = {};
    if (this.state.search) {
      extraParams.keyword = [this.state.search];
    }
    AlumniService.getAlumni({ ...params, ...extraParams })
      .then((res) => {
        if (res.data && res.data.results) {
          this.setState({
            alumni: res.data.results.map((alumni) => ({
              id: alumni.id,
              title: `${alumni.first_name} ${alumni.last_name}`,
              value: alumni,
              type: 'alumni',
            })),
          });
        }
      })
      .catch((error) => logger.error(error));
  }

  handleSearch = (search) => {
    this.setState({ search }, () => this.fetchSessions());
  };

  render() {
    return (
      <DropDown
        title="Alumni"
        options={this.state.alumni.slice(0, 5)}
        searchable
        handleSelect={(option) => this.props.handleSelect(option)}
        onSearch={this.handleSearch}
      />
    );
  }
}

export default UserFilter;
