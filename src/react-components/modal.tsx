import * as React from 'react';

export const Modal = ({isShown, children}: {isShown: boolean, children: React.ReactNode}) => (
    <React.Fragment>
    {isShown ? (
        <React.Fragment>
        <div className="modal-overlay" />
        <div className="modal-row">
            <div className="modal-column">
                <div className="modal-panel">
                    {children}
                </div>
            </div>
        </div>
        </React.Fragment>
    ) : ''}
    </React.Fragment>
);
