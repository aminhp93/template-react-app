import React, { Component } from 'react';
import PropTypes from 'prop-types';

class MentionOptions extends Component {
  componentDidMount() {
    document.addEventListener('mousedown', this.close);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.close);
  }

  close = (e) => {
    const { close } = this.props;

    if (this.modalDialogRef && !this.modalDialogRef.contains(e.target)) {
      close();
    }
  };

  render() {
    const {
      pageX, pageY, viewProfile, sendMessage, isCurrentUser,
    } = this.props;
    return (
      <div
        className="mention-options"
        style={{ left: `${pageX}px`, top: `${pageY}px` }}
        ref={(e) => this.modalDialogRef = e}
      >
        {!isCurrentUser &&
          <div
            className="mention-options__child"
            onClick={() => sendMessage()}
          >
            Send message
          </div>
        }
        <div
          className="mention-options__child"
          onClick={() => viewProfile()}
        >
          View profile
        </div>
      </div>
    );
  }
}

MentionOptions.propTypes = {
  pageX: PropTypes.number,
  pageY: PropTypes.number,
  close: PropTypes.func.isRequired,
  viewProfile: PropTypes.func.isRequired,
  sendMessage: PropTypes.func.isRequired,
  isCurrentUser: PropTypes.bool,
};

MentionOptions.defaultProps = {
  pageX: 0,
  pageY: 0,
};

export default MentionOptions;
