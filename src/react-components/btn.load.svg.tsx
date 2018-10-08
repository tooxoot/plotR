import * as ReactRedux from 'react-redux';
import * as React from 'react';
import { ReduxState } from '../redux-model/redux.state';
import { ChangeSvgSource } from '../redux-model/redux.change.svg.source.action';
import { ProcessSvgSource } from '../redux-model/redux.process.action';

interface Props {
    // tslint:disable: no-any
    importSVG: (e: React.ChangeEvent<HTMLInputElement>) => any;
}

const BTN_LOAD_SVG_COMPONENT: React.SFC<Props> = ({importSVG}) => (
    <React.Fragment>
        <label className="button content-middle-centered">
            <div>IMPORT</div>
            <input className="hidden" name="btn-load" type="file" onChange={importSVG}/>
        </label>

    </React.Fragment>
);

const  dispatchToProps = (dispatch: ReactRedux.Dispatch<ReduxState>) => ({
    importSVG: (event: React.ChangeEvent<HTMLInputElement>) => {
        const reader = new FileReader();
        reader.onload = () => {
            const dp = new DOMParser();
            const txt = reader.result as string;
            const svgDocument = dp.parseFromString(txt, 'image/svg+xml');
            const svgElement = svgDocument.children[0] as HTMLElement;

            dispatch<{type: string}>(ChangeSvgSource.action(svgElement));
            dispatch<{type: string}>(ProcessSvgSource.action());
        };

        const file = event.target.files[0];
        reader.readAsText(file);
        event.target.value = '';
    },
});

export const SVG_IMPORT_BUTTON = ReactRedux.connect(
    null,
    dispatchToProps
)(BTN_LOAD_SVG_COMPONENT);
