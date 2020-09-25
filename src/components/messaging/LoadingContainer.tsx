import * as Sentry from '@sentry/react';
import * as React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';

import LoadingIndicator from 'components/LoadingIndicator';

import { updateLoadingSuccess } from 'reducers/loading';

interface IProps {
  updateLoadingSuccess: any,
  loading: boolean,
}

class LoadingContainer extends React.PureComponent<IProps> {
  render() {
    const { loading } = this.props;
    if (loading) {
      return <LoadingIndicator/>
    }
    return null
  }
}

const mapStateToProps = (state) => {
  return {
    loading: get(state, 'loading'),
  };
};

const mapDispatchToProps = {
  updateLoadingSuccess
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(LoadingContainer, { name: "LoadingContainer"}));
