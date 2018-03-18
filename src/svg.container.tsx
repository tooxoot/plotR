import * as React from 'react';

export function SVG_CONTAINER() {
    return (
        <div id="SVG_CONTAINER" style={{display: 'none'}}>
            <svg id="SVG" height="500" width="500">
                {/* <path id="3" d="M0 0 L500 500 200 100 Z" style={{fill : 'green', stroke : 'black'}}/>
                <path id="3" d="M0 0 L 0 500 500 500 500 0 Z" style={{fill : 'green', stroke : 'black'}}/> */}

                <line
                    id="0"
                    x1="50"
                    y1="25"
                    x2="100"
                    y2="150"
                    style={{fill : 'none', stroke : 'black'}}
                />
                <polyline
                    id="0"
                    points="50, 75, 100, 175, 100, 250, 60, 250"
                    style={{fill : 'none', stroke : 'black'}}
                />
                <polygon
                    id="0"
                    points="50, 125, 100, 225, 100, 300, 60, 300"
                    style={{fill : 'none', stroke : 'black'}}
                />
                <circle id="0" cx="250" cy="150" r="50" style={{fill : 'none', stroke : 'black'}} />

                <rect
                    id="0"
                    x="0"
                    y="0"
                    width="50"
                    height="50"
                    style={{fill : 'none', stroke : 'black'}}
                    transform="translate(25)"
                />
                <rect
                    id="0"
                    x="50"
                    y="0"
                    width="50"
                    height="50"
                    style={{fill : 'none', stroke : 'black'}}
                    transform="translate(25, 25)"
                />
                <rect
                    id="0"
                    x="50"
                    y="0"
                    width="50"
                    height="50"
                    style={{fill : 'none', stroke : 'red'}}
                    transform="scale(5)"
                />
                <rect
                    id="0"
                    x="50"
                    y="0"
                    width="50"
                    height="50"
                    style={{fill : 'none', stroke : 'red'}}
                    transform="scale(5, 0)"
                />
                <rect
                    id="0"
                    x="50"
                    y="0"
                    width="50"
                    height="50"
                    style={{fill : 'none', stroke : 'red'}}
                    transform="scale(5, 1)"
                />
                <rect
                    id="0"
                    x="100"
                    y="0"
                    width="50"
                    height="50"
                    style={{fill : 'none', stroke : 'green'}}
                    transform="rotate(45)"
                />
                <rect
                    id="0"
                    x="100"
                    y="0"
                    width="50"
                    height="50"
                    style={{fill : 'none', stroke : 'green'}}
                    transform="rotate(20, 150, 200)"
                />
                <rect
                    id="0"
                    x="200"
                    y="0"
                    width="50"
                    height="50"
                    style={{fill : 'none', stroke : 'blueviolet'}}
                    transform="skewX(10)"
                />
                <rect
                    id="0"
                    x="200"
                    y="0"
                    width="50"
                    height="50"
                    style={{fill : 'none', stroke : 'blueviolet'}}
                    transform="skewY(10)"
                />
                <rect
                    id="0"
                    x="100"
                    y="100"
                    width="50"
                    height="50"
                    style={{fill : 'none', stroke : 'chocolate'}}
                    transform="translate(100, -100) rotate(20)"
                />

                <ellipse
                    id="0"
                    cx="25"
                    cy="50"
                    rx="25"
                    ry="50"
                    style={{fill : 'none', stroke : 'black'}}
                    transform="rotate(25, 25, 50)"
                />
                <ellipse id="1" cx="25" cy="50" rx="25" ry="50" style={{fill : 'none', stroke : 'black'}}/>

                {/* <path id="0" d="M150 0 L75 200 L225 200 200 100 Z" style={{fill : 'none', stroke : 'black'}}/>
                <path id="1" d="M150 150 l100 0 0 100 -100 0 Z" style={{fill : 'grey', stroke : 'black'}}/>
                <path
                    id="2"
                    d="M0 50 L180 50 L150 100 L200 50 L200 250 L0 250 Z"
                    style={{fill : 'none', stroke : 'black'}}
                />
                <path id="3" d="M0 0 L500 500 200 100 Z" style={{fill : 'grey', stroke : 'black'}}/>
                <path
                    id="4"
                    d="M150,0l-75 200 l225-100-10-10L200 200L300 400Q300,300 400,400 200,200 400,200z"
                    style={{fill : 'green', stroke : 'red'}}
                />
                <path id="5" fill="green" stroke="black" d="M 50 50 T 100 100 100 50 150 100"/>
                <path id="6s" fill="none" stroke="black" d="M 50 100 S 100 150 100 100  150 150  200 100"/>

                <circle cx="50" cy="50" r="2"  fill="red" />
                <circle cx="100" cy="100" r="2"  fill="red" />
                <circle cx="100" cy="50" r="2"  fill="red" />
                <circle cx="150" cy="100" r="2"  fill="red" />

                <path id="1" d="M150 0 l-75 200 l150 0 Z" style={{fill : 'grey', stroke : 'black'}}/>

                <circle cx="50" cy="100" r="2"  fill="red" />
                <circle cx="100" cy="150" r="2"  fill="red" />
                <circle cx="100" cy="100" r="2"  fill="red" />
                <circle cx="150" cy="150" r="2"  fill="red" />
                <circle cx="200" cy="100" r="2"  fill="red" /> */}

            </svg>
            SVG_INPUT_RESULT
            <svg id="SVG_INPUT_RESULT" height="500" width="500"/>
            SVG_CLIP
            <svg id="SVG_CLIP" height="500" width="500"/>
            SVG_CLIPRES
            <svg id="SVG_CLIPRES" height="500" width="500"/>
        </div>
    );
}