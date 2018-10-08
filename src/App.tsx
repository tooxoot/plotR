import * as React from 'react';
import './App.css';
import { SVG_VIEW } from './react-components/svg.view';
import { SELECT_LIST } from './react-components/select.list';
import { SVG_DEBUG_VIEW, SVG_DEBUG_BUTTON } from './react-components/svg.debug.view';
import { SVG_IMPORT_BUTTON } from './react-components/btn.load.svg';
import { FILL_INPUT } from './react-components/svg.line.filling.input';
import { ExportModal } from './react-components/btn.export.svg';

class App extends React.Component {
  public render() {
    return (
      <div className="app">
        <SVG_DEBUG_VIEW />
        <div className="main-grid">
          <div className="topbar item-margin-5">
            <SVG_IMPORT_BUTTON />
            <ExportModal />
            <SVG_DEBUG_BUTTON />
          </div>
          <div className="view" >
            <SVG_VIEW />
          </div>
          <div className="toolbox">
           <FILL_INPUT />
          </div>
          <div className="treeview">
            <SELECT_LIST />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
