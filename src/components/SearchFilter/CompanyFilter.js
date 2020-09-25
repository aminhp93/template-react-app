import React from 'react';
import PropTypes from 'prop-types';
import FilterService from 'services/Filter';
import DropDown from 'components/DropDown';

class CompanyFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      companies: [],
      search: '',
    };
    this.handleSearch = this.handleSearch.bind(this);
  }

  componentDidMount() {
    this.fetchCompanies();
  }

  componentWillUnmount() {
    this.setState = () => {};
  }

  fetchCompanies() {
    const params = {};
    if (this.state.search) {
      params.q = this.state.search;
    }
    FilterService.getFilterValues('companies', params).then((res) => {
      if (res && res.data) {
        this.setState({
          companies: res.data.map((company) => ({
            id: company.employer,
            title: company.employer,
            value: company.employer,
            count: company.count,
            type: 'company',
          })),
        });
      }
    });
  }

  handleSearch(search) {
    this.setState({ search }, () => this.fetchCompanies());
  }

  render() {
    return (
      <DropDown
        title="Company"
        options={this.state.companies}
        handleSelect={this.props.onSelect}
        searchable
        onSearch={this.handleSearch}
      />
    );
  }
}

CompanyFilter.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default CompanyFilter;
