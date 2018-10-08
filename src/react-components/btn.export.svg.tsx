import * as ReactRedux from 'react-redux';
import * as React from 'react';
import { ReduxState } from '../redux-model/redux.state';
import { HPGLUtils } from '../hpgl-export/hpgl.processor';
import { TreeTypes as TT } from '../data-model/model.tree.types';
import { TreeUtils as TU } from '../data-model/model.tree.utils';
import { Modal } from './modal';

const cloneScaling = (scaling: HPGLUtils.Scaling) => ({
    inputDimensions: {...scaling.inputDimensions},
    outputDimensions: {...scaling.outputDimensions},
    offset: {...scaling.offset},
});

const XYInput = (
    {stateKey, xyKey, scaling, onScalingChange}: {
        stateKey: keyof HPGLUtils.Scaling,
        xyKey: 'X' | 'Y',
        scaling: HPGLUtils.Scaling,
        onScalingChange: (scaling: HPGLUtils.Scaling) => void,
    }
) => (
    <React.Fragment>
        <div>
            {stateKey.toUpperCase()} {xyKey}:
            <input
                key={`input-${stateKey}-${xyKey}`}
                className={`input-hpgl-${stateKey}`}
                type="number"
                value={scaling[stateKey][xyKey]}
                onChange={(e) => {
                    const newScaling = cloneScaling(scaling);
                    newScaling[stateKey][xyKey] = +(e.target.value);
                    onScalingChange(newScaling);
                }}
            />
        </div>
    </React.Fragment>
);

const  ExportOptionsInputs = (props: {
    onScalingChange: (s: HPGLUtils.Scaling) => void;
    scaling: HPGLUtils.Scaling;
}) => (
    <React.Fragment>
        <XYInput stateKey="outputDimensions" xyKey="X" {...props} />
        <XYInput stateKey="outputDimensions" xyKey="Y" {...props} />
        <XYInput stateKey="inputDimensions" xyKey="X" {...props} />
        <XYInput stateKey="inputDimensions" xyKey="Y" {...props} />
        <XYInput stateKey="offset" xyKey="X" {...props} />
        <XYInput stateKey="offset" xyKey="Y" {...props} />
    </React.Fragment>
);

const DownloadButton = ReactRedux.connect(
    ({nodeIndex, childRelations}: ReduxState) => ({nodeIndex, childRelations})
)(
    (props: {
        nodeIndex: TT.NodeIndex,
        childRelations: TT.ChildRelations,
        scaling: HPGLUtils.Scaling,
    }) => {
        const drawables = TU.getDrawables(props.nodeIndex, props.childRelations);
        const hpglLines = HPGLUtils.convertToHPGL(drawables, props.scaling);
        const file = new Blob(hpglLines, {type: 'text'});
        const url = URL.createObjectURL(file);

        console.log(hpglLines);

        return (
            <a className="button content-middle-centered" href={url} download={'export.hpgl'}> DOWNLOAD </a>
        );
    }
);

interface Props {
    dimensions: TT.Dimensions;
}
interface State {
    scaling: HPGLUtils.Scaling;
    dialogueIsShown: boolean;
}

class ComponentExportModal extends React.Component<Props, State> {
    constructor (props: Props) {
        super(props);
        this.state = {
            scaling: {
                inputDimensions: {X: props.dimensions.X, Y: props.dimensions.Y},
                outputDimensions: {X: props.dimensions.X, Y: props.dimensions.Y},
                offset: {...props.dimensions.center},
            },
            dialogueIsShown: false,
        };
    }

    readonly showDialogue = () =>  this.setState({dialogueIsShown: true});
    readonly hideDialogue = () =>  this.setState({dialogueIsShown: false});

    render() { return (
        <React.Fragment>
            <button onClick={this.showDialogue}>EXPORT</button>
            <Modal isShown={this.state.dialogueIsShown}>
                Export
                <button className="small-circle upper-right" onClick={this.hideDialogue}>X</button>
                <div className="form">
                    <ExportOptionsInputs
                        onScalingChange={(scaling: HPGLUtils.Scaling) => this.setState({scaling})}
                        scaling={this.state.scaling}
                    />
                    <DownloadButton scaling={this.state.scaling} />
                </div>
            </Modal>
        </React.Fragment>
    ); }
}

export const ExportModal = ReactRedux.connect(
    ({dimensions}: ReduxState) => ({dimensions})
)(ComponentExportModal);
