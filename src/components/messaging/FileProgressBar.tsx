import * as Sentry from '@sentry/react';
import * as React from 'react';

interface IProps {
  loaded: number;
}

class FileProgressBar extends React.PureComponent<IProps> {
  render() {
    const { loaded } = this.props;
    return (
      <div className="progress-bar border">
        <div className="progress-bar__loaded" style={{ width: `${loaded}%` }} />
      </div>
    )
  }
}

export default Sentry.withProfiler(FileProgressBar, { name: "FileProgressBar"});
