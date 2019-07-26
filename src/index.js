// @flow

import React from 'react';
import ReactDOM from 'react-dom';
import { unregister } from './registerServiceWorker';
// components
import Routes from './routes';

const rootElement: HTMLElement = document.getElementById('root');

ReactDOM.render(<Routes />, rootElement);
unregister();
