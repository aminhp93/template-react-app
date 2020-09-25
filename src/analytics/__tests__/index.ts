import { mocked } from 'ts-jest/utils';
import { getInstance } from 'amplitude-js';
import { tracked } from '@platform/analytics';

jest.mock('amplitude-js');


describe('@platform/analytics', () => {
  class SomeService {
    @tracked('An event')
    event() {}

    @tracked('Another event', ['param'])
    eventAndParam(param: string) {}

    @tracked('Another event 2', [null, 'param2'])
    eventAndMultipleParam(param1: string, param2: string) {}
  }

  test('track event only', () => {
    const service = new SomeService();
    service.event();

    expect(mocked(getInstance().logEvent).mock.calls)
      .toContainEqual(['An event', {}]);
  });

  test('track event and params', () => {
    const service = new SomeService();
    service.eventAndParam('hello');

    expect(mocked(getInstance().logEvent).mock.calls)
      .toContainEqual(['Another event', {
        param: 'hello'
      }]);
  });

  test('track event and multiple params', () => {
    const service = new SomeService();
    service.eventAndMultipleParam('hello', 'world');

    expect(mocked(getInstance().logEvent).mock.calls)
      .toContainEqual(['Another event 2', {
        param2: 'world'
      }]);
  });
});
