import React, { Component } from 'react';
import clsx from 'clsx';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';

import USER_ICON_URL from '@img/ic-user.svg';


class DropDown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false,
    };
    this.handleSearch = debounce((term) => props.onSearch(term), 600);
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentDidMount() {
    window.document.addEventListener('click', this.hideDropDown);
  }

  componentWillUnmount() {
    window.document.removeEventListener('click', this.hideDropDown);
  }

  toggleDropDown() { this.setState({ dropdownOpen: !this.state.dropdownOpen }); }

  hideDropDown = (e) => {
    if (this.inputSearchRef) {
      if (this.dropDownToggleRef && !this.dropDownToggleRef.contains(e.target)
      && !this.inputSearchRef.contains(e.target)) {
        this.setState({ dropdownOpen: false });
      }
    } else if (this.dropDownToggleRef && !this.dropDownToggleRef.contains(e.target)) {
      this.setState({ dropdownOpen: false });
    }
  };

  handleSelect(option) {
    if (this.props.title === 'Alumni') {
      this.inputSearchRef.value = option.title;
      this.setState({
        dropdownOpen: false,
      });
    } else if (this.inputSearchRef) this.inputSearchRef.value = '';
    this.props.handleSelect(option);
  }

  renderDropDownList() {
    return (
      <div className="dropdown-list">
        {this.props.options && this.props.options.map((option) => (
          <a
            key={option.id}
            className="dropdown-item"
            onClick={() => this.handleSelect(option)}
          >
            {
            this.props.title === 'Alumni'
              ? (
                <div>
                  <img src={(option && option.value && option.value.profile_image) || USER_ICON_URL} alt="" />
                  {option.title}
                </div>
              )
              : option.title
          }
          </a>
        ))}
      </div>
    );
  }

  render() {
    return (
      <div className="filter-dropdown d-table-cell">
        <div className="dropdown d-block">
          {
            this.props.title === 'Alumni'
              ? null
              : (
                <a
                  id={`SearchFilter${this.props.title.split(' ').join('')}`}
                  ref={(ref) => this.dropDownToggleRef = ref}
                  className="dropdown-toggle"
                  onClick={() => this.toggleDropDown()}
                >
                  {this.props.title}
                </a>
              )
          }
          <div className={clsx('dropdown-menu', { show: this.props.title === 'Alumni' || this.state.dropdownOpen })}>
            {this.props.searchable
            && (
              <>
                <div className="form-group px-2 pt-2 mb-2">
                  <input
                    ref={(ref) => this.inputSearchRef = ref}
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search"
                    onChange={(event) => {
                      this.setState({
                        dropdownOpen: true,
                      });
                      this.handleSearch(event.target.value);
                    }}
                  />
                </div>
              </>
            )}

            {this.state.dropdownOpen ? this.renderDropDownList() : null}
          </div>
        </div>
      </div>
    );
  }
}

DropDown.propTypes = {
  title: PropTypes.string.isRequired,
  handleSelect: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  searchable: PropTypes.bool,
  onSearch: PropTypes.func,
};

export default DropDown;
