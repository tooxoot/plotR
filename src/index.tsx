import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import { Provider } from 'react-redux';
import { RSTORE } from './redux-model/redux.state';
import { processSVGSource } from './redux-model/redux.process.action';

ReactDOM.render(
  <Provider store={RSTORE}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
RSTORE.dispatch<{type: string}>(processSVGSource());