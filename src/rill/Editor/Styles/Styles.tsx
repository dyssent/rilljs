import React from 'react';
import { Filters } from './Filters';
import { Gradients } from './Gradients';
import { Patterns } from './Patterns';

export interface StylesProps {
}

export function Styles(props: StylesProps) {
    return (
        <>
            <Filters />
            <Patterns />
            <Gradients />
            <marker id="arrow" markerWidth="9" markerHeight="6" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,1 L0,5 L9,3 z" fill="rgb(129,130,185)" />
            </marker>
        </>
    ); 
}
