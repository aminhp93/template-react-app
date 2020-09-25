import { AmplitudeClient, getInstance } from 'amplitude-js';


export interface AnalyticsIntegration {
  integrate: (analytics: Analytics) => void;
}

export class Analytics {
  client: AmplitudeClient;
  integrations: AnalyticsIntegration[]

  constructor(apiKey: string) {
    this.client = getInstance();
    this.client.init(apiKey);
  }

  enableIntegration(integration: AnalyticsIntegration): void {
    integration.integrate(this);
  }
}

/**
 * Decorator to enable tracking user events. It is a convenient method intended
 * to be used in services. For individual event tracking, please use {@code Analytics}.
 */
export const tracked = (event: string, captures: string[] = []) =>
  // eslint-disable-next-line
  (_target: Object, _key: string, property: TypedPropertyDescriptor<Function>): void => {
    const method = property.value!;

    property.value = (...params: any[]) => {
      const trackedParams = captures
        .map((name, i) => [name, params[i]])
        .filter(([name]) => !!name)
      getInstance().logEvent(event, Object.fromEntries(trackedParams));
      return method.apply(this, params);
    };
  };

export default Analytics;
