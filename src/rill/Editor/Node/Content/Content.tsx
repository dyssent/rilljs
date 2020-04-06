import React from 'react';

export interface NodeContentProps {
    width: number;
    height: number;
}

export function Content(props: React.PropsWithChildren<NodeContentProps>) {
    const { width, height } = props;
    return (
        <>
            {props.children}
        </>
    );
}

/*
<switch>
    <foreignObject
        x="0"
        y="20"
        width={width}
        height={height}
        requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
    >
        <p>Text goes here adsjh asjkdh ajkshd jashjdkahskjdasd</p>
    </foreignObject>
    <text
        x={width / 2}
        y={height / 2}
    >
        Your SVG viewer cannot display html.
    </text>
</switch>
<text x="5mm" y="2.1cm" >One,
    <tspan dy="-0.5cm">Two,</tspan>
    <tspan dy="-0.5cm">Three!</tspan>
</text>
*/
