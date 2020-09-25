import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import GiphySuggestions from './GiphySuggestions';

class GiphySelect extends React.Component {
  state = {
    shouldShowSuggestions: false,
  };

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false);
  }

  handleClick = (e) => {
    if (this.node.contains(e.target)) return;
    this.hideSuggestions();
  };

  toggleSuggestions = (e) => {
    if (e) {
      e.stopPropagation();
    }
    this.setState(({ shouldShowSuggestions }) => ({
      shouldShowSuggestions: !shouldShowSuggestions,
    }));
  };

  hideSuggestions = () => this.setState({ shouldShowSuggestions: false });

  handleSelect = (gif) => {
    const { onSelect } = this.props;

    onSelect(gif);
    this.toggleSuggestions();
  };

  render() {
    let { position } = this.props;
    const { shouldShowSuggestions } = this.state;

    if (!position) {
      position = this.node && this.node.getBoundingClientRect().top < 400 ? 'bottom' : 'top';
    }
    return (
      <div className="giphy-select" ref={(ref) => this.node = ref}>
        <div
          className={clsx('giphy-select__selector d-flex justify-content-center align-items-center', { pressed: shouldShowSuggestions })}
          onClick={this.toggleSuggestions}
        >
          <div className="giphy-select__selector__text">GIF</div>
        </div>
        { shouldShowSuggestions && <GiphySuggestions onSelect={this.handleSelect} position={position} /> }
      </div>
    );
  }
}

GiphySelect.propTypes = {
  onSelect: PropTypes.func,
  position: PropTypes.string,
};

GiphySelect.defaultProps = {
  onSelect: () => {},
  position: undefined,
};

export default GiphySelect;
