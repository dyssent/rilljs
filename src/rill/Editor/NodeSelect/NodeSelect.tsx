import React, { useContext, useMemo } from 'react';

import { Node } from '../../model';
import { Options, OptionsContext } from '../options';
import { ThemeContext, Theme } from '../theme';
import { Select, SelectItemRendererProps } from '../Components';

export interface NodeSelectProps {
    onSelect: (node: Node) => void;
    predicate?: (node: Node) => boolean;
}

export function NodeSelect(props: NodeSelectProps) {
    const {
        onSelect,
        predicate
    } = props;

    const theme = useContext<Theme>(ThemeContext).classes;
    const options = useContext<Options>(OptionsContext);
    const registry = options.registry;
    
    const nodes = useMemo(() => {
        return registry.findNodes(null, predicate);
    }, [predicate, registry]);

    function nodeRenderer(itemProps: SelectItemRendererProps<Node>) {
        const design = itemProps.item.designDefn;
        const defn = itemProps.item.defn;
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}
                onClick={itemProps.onClick}
            >
                <span
                    style={design && design.color ? {color: design.color} : undefined}
                >
                    {defn.name}
                </span>
                <small className={theme.textMuted} >
                    {defn.description}
                </small>
            </div>            
        );        
    }

    function nodePredicate(node: Node, filter: string): boolean {
        const fl = filter.toLowerCase();
        const nl = (node.defn.class + ' ' + node.defn.name + ' ' + node.defn.description).toLowerCase();
        return nl.indexOf(fl) >= 0;
    }

    return (
        <Select<Node>
            items={nodes}
            itemRenderer={nodeRenderer}
            itemPredicate={nodePredicate}
            onSelect={onSelect}
        />
    );
}
