import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

class Tabs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 1,
    };
  }

  changeTab = (currentTab) => {
    this.setState({ currentTab });
  };

  render() {
    return (
      <div className={this.props.className || ''}>
        <ul className={clsx('nav nav-tabs', { 'tab-padding': this.props.padding })}>
          {this.props.tabs.map((tab) => (
            <li className="nav-item" key={tab.id}>
              <a
                id={tab.title && `${tab.title.toLowerCase()}TabLink`}
                className={clsx('nav-link', { active: this.state.currentTab === tab.id })}
                onClick={() => this.changeTab(tab.id)}
              >
                <b>{tab.title}</b>
              </a>
            </li>
          ))}
        </ul>
        <hr className="mt-0" />
        <div className={clsx('tab-content pb-4', { 'tab-padding': this.props.padding })}>
          {this.props.tabs.filter((tab) => tab.id === this.state.currentTab)[0].render()}
        </div>
      </div>
    );
  }
}

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    render: PropTypes.func,
  })),
  className: PropTypes.string,
  padding: PropTypes.bool,
};

export default Tabs;
