// @flow

import React from 'react';
import ReactDOM from 'react-dom';
// components
import App from 'components/App';

it('renders without crashing', () => {
  const rootElement: any = document.createElement('div');
  ReactDOM.render(<App />, rootElement);
  ReactDOM.unmountComponentAtNode(rootElement);
});
