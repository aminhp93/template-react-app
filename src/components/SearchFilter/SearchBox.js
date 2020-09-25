import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid/v4';

class SearchBox extends React.Component {
  constructor(props) {
    super(props);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && e.target.value) {
      const tag = {
        id: uuid(),
        title: e.target.value,
        value: e.target.value,
        type: 'keyword',
      };
      this.props.onAddTag(tag);
      this.inputRef.value = '';
    }
  }

  render() {
    return (
      <div className="input-row">
        <div className="data-entry">
          <input
            ref={(ref) => this.inputRef = ref}
            type="text"
            className="input keyword-input"
            placeholder={this.props.placeholder || 'Enter a keyword'}
            onKeyPress={this.handleKeyPress}
          />
        </div>
      </div>
    );
  }
}

SearchBox.propTypes = {
  onAddTag: PropTypes.func,
  placeholder: PropTypes.string,
};

export default SearchBox;
