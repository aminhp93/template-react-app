import * as Sentry from '@sentry/react';
import * as React from 'react';

interface IProps {
  close: any;
  pageX: number,
  pageY: number,
  viewProfile: any,
  sendMessage: any,
  isCurrentUser: boolean
}


class MentionOptions extends React.PureComponent<IProps> {
  modalDialogRef: any;

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

export default Sentry.withProfiler(MentionOptions, { name: "MentionOptions"});
