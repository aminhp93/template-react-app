import * as React from 'react';
import * as Sentry from '@sentry/browser';
import { notification } from 'antd';

import config from 'config';
import UserInfo from 'utils/userInfo';
import ConfigService from 'services/Config';
import PageTitle from 'components/PageTitle';
import LoadingIndicator from 'components/LoadingIndicator';

interface IProps {
  demo: boolean;
}

interface IState {
  loading: boolean;
  salesforceId: string;
}

class Interview extends React.Component<IProps, IState> {
  state = {
    loading: false,
    salesforceId: '',
  }

  componentDidMount() {
    this.getSalesforceId();
  }

  componentDidUpdate(prevProps) {
    // When switching between Interview and Interview Demo page
    if (this.props.demo !== prevProps.demo) this.getSalesforceId();
  }

  getSalesforceId() {
    if (!this.props.demo) {
      const userInfo = UserInfo.getUserInfo();
      const salesforceId = userInfo && userInfo.salesforce_id;
      this.setState({ salesforceId })
      // Log if the user try to access this page but doesn't have a Salesforce ID
      if (!salesforceId) {
        Sentry.captureMessage(`User with ID ${userInfo.id} doesn't have Salesforce ID`);
      }
    } else {
      this.setState({ loading: true });
      ConfigService.fetchConfig('DEMO_SALESFORCE_ID').then((res) => {
        this.setState({
          salesforceId: res.data.value,
        });
      }).catch((e) => {
        notification.error({
          message: 'Error',
          description: e,
        });
      }).finally(() => this.setState({ loading: false }));
    }
  }

  render() {
    const { demo } = this.props;
    const { loading, salesforceId } = this.state;

    const fellowIdParam = (salesforceId && salesforceId !== '') ? `fellow_id=${salesforceId}` : '';
    const title = `Interviews status ${demo ? '(Demo)' : ''}`;

    return (
      <div className="main-page">
        <div className="container main-page">
          <PageTitle title={title} />
          <h1 className="page-title ml-5 pl-3 mt-5">{title}</h1>
          {loading ?
            <LoadingIndicator />
            :
            <iframe className="form-assembly-iframe" src={`${config.formUrls.interview}?${fellowIdParam}`} frameBorder="0" />
          }
        </div>
      </div>
    );
  }
}

export default Interview;
