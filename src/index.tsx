import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import { Provider } from 'react-redux';
import { RSTORE } from './redux-model/redux.state';
import { ProcessSvgSource } from './redux-model/redux.process.action';
import { ClipTree } from './redux-model/redux.clip.tree.action';

RSTORE.dispatch<{type: string}>(ProcessSvgSource.action());
RSTORE.dispatch<{type: string}>(ClipTree.action());
console.log(RSTORE.getState());

ReactDOM.render(
  <Provider store={RSTORE}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement
);

registerServiceWorker();