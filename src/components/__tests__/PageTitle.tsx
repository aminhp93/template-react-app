/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { render } from '@testing-library/react'

import { PageTitle } from '@platform/components/PageTitle';


describe('@platform/components/PageTitle', () => {
  let update: any;

  class Container extends React.Component {
    state: { title: string }

    constructor(props: any) {
      super(props);
      this.state = { title: 'Hello' }
      update = this.setState.bind(this)
    }

    render() {
      return (
        <PageTitle title={this.state.title} />
      )
    }
  }

  const component = <Container />

  test('update document title on mount', () => {
    render(component);
    expect(document.title).toBe('Hello | Insight Community Platform');
  });

  test('update document title on update', () => {
    render(component);
    update({ title: 'World' })
    expect(document.title).toBe('World | Insight Community Platform');
  });
});
