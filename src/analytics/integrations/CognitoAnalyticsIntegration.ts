import { Hub } from '@aws-amplify/core'
import { AnalyticsIntegration, Analytics } from '@platform/analytics';


export class CognitoAnalyticsIntegration implements AnalyticsIntegration {

  integrate(analytics: Analytics) {
    Hub.listen('auth', ({ payload }) => {
      // analytics.client.identify();
    });
  }
}
