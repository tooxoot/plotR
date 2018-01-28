import * as React from 'react';
import './App.css';

import { processSVG } from './svg-import/svg.input.processor';
import { MODEL } from './data-model/svg.model';
import { ClipUtils } from './data-model/svg.clipping';
import { calculateSVGString } from './svg-import/svg.view';
// import {HPGLUtils} from './hpgl-export/hpgl.processor';
import { createSimpleLineFilling } from './data-model/svg.line.filling';

// const logo = require('./logo.svg');

class App extends React.Component {
  render() {
    const oldSvgRoot = document.getElementById('SVG');
    const prrocessingResults = processSVG(oldSvgRoot);
    console.log(prrocessingResults);
    prrocessingResults.forEach(result => {
      MODEL.push(result);
    });

    console.log(MODEL.elements);

    const el = MODEL.getElements(3)[0];
    // console.log(el)
    const lines = createSimpleLineFilling(el, 0, 2000, 0);
    lines.push(...createSimpleLineFilling(el, 45, 2000, 500));
    lines.push(...createSimpleLineFilling(el, 90, 2000, 0));
    lines.push(...createSimpleLineFilling(el, 135, 2000, 750));

    MODEL.push(...lines);

    MODEL.getElements().forEach(element => {
      document.getElementById('SVG_INPUT_RESULT').innerHTML += calculateSVGString(element);
    });

    // SEE angularfile

    const model = MODEL.getElements();
    console.log('before clipping');
    console.log(model);
    const clipres = ClipUtils.clip(model);
    console.log('after clipping');
    console.log(model);
    const views = clipres.map(c => calculateSVGString(c));
    // const hpglStrings = HPGLUtils.convertToHPGL(
    //   clipres,
    //   {outputDimensions: {X: 15000, Y: 10000}, inputDimensions: {X: 50000, Y: 50000},
    //   offset: {X: 0, Y: 0}}
    // );
    // console.log(hpglStrings)
    // console.log( hpglStrings.reduce((out, string) => out += string + '\n') );
    views.forEach(view => {
      document.getElementById('SVG_CLIPRES').innerHTML += view;
    });

    return (

      <div className="App">
        {/* <div id="topbar"/> */}
        {/* <div id="view"/> */}
        {/* <div id="treeview"/> */}
        {/* <div id="toolbox"/> */}
      </div>
    );
  }
}

export default App;
