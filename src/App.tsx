import * as React from 'react';
import './App.css';
import { SVG_VIEW } from './react-components/svg.view';
import { SELECT_LIST } from './react-components/select.list';
import { SVG_DEBUG_VIEW, SVG_DEBUG_BUTTON } from './react-components/svg.debug.view';

class App extends React.Component {
  public render() {
    return (
      <div className="app">
        <SVG_DEBUG_VIEW />
        <div className="main-grid">
          <div id="topbar">
            <SVG_DEBUG_BUTTON />
          </div>
          <div id="view" >
            <SVG_VIEW />
          </div>
          <div id="treeview"/>
          <div id="toolbox">
            <SELECT_LIST />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
