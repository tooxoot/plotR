import * as React from 'react';
import './App.css';

// const logo = require('./logo.svg');

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <div id="topbar"/>
        <div id="view"/>
        <div id="treeview"/>
        <div id="toolbox"/>
      </div>
    );
  }
}

export default App;
