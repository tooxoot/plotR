import * as React from 'react';
import './App.css';
import { SVG_VIEW_COMPONENT } from './react-components/svg.view';
import { Selectlist } from './react-components/select.list';

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <div id="topbar"/>
        <div id="view" >
          <SVG_VIEW_COMPONENT />
        </div>
        <div id="treeview"/>
        <div id="toolbox">
          <Selectlist />
        </div>
      </div>
    );
  }
}

export default App;
