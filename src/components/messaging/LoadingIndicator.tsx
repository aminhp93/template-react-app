import * as Sentry from '@sentry/react';
import * as React from 'react';

interface IProps {
  containerClass?: string;
}

class LoadingIndicator extends React.PureComponent <IProps> {
  render() {
    const { containerClass } = this.props;
    return (
      <div className={`spinner ${containerClass}`}>
        <div className="bounce1" />
        <div className="bounce2" />
        <div className="bounce3" />
        <div className="bounce4" />
      </div>
    )
  }
}

export default Sentry.withProfiler(LoadingIndicator, { name: "LoadingIndicator"});
