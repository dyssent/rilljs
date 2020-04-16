import React, { useState } from 'react';

import { ControlGroup, InputField, Divider } from '../../Components';
import { NodeDrawerProps } from '../props';
import { IOValue } from '../../../model';
import { ValueDrawer } from '../ValueDrawer';

export function NodeDrawer(props: React.PropsWithChildren<NodeDrawerProps>) {
    const {
        node,
        actions,
        options,
        theme,
        invalid,
        children
    } = props;

    const { readonly } = options;
    const [, redraw] = useState({});
    const classes = theme.classes;
    const design = node.designDefn;

    function onNodeNameChange(event: React.FormEvent<HTMLInputElement>) {
        const value = event.currentTarget.value;
        if (node.nodeName === value) {
            return;
        }

        actions.beginNodeEdit(node);
        node.nodeName = value && value !== '' ? value : undefined;
        actions.finishNodeEdit();
        redraw({});
    }

    const valueInternals = node.getValueInternals();
    const valueInputs = node.getValueInputs();
    const valueOutputs = node.getValueOutputs();

    function renderValue(v: IOValue) {
        return (
            <ValueDrawer
                key={v.id}
                value={v}
                node={node}
                actions={actions}
                options={options}
                theme={theme}
            />
        );
    }

    return (
        <div className={classes.node.container}>
            <div
                className={classes.node.header}
                style={design && design.color ? {backgroundColor: design.color} : undefined}
            >
                <span>
                    {node.nodeName || node.defn.name || node.defn.class}
                </span>
            </div>
            <div
                className={classes.node.content}
            >
                {
                    (invalid && invalid !== '') &&
                    <div
                        className={classes.node.error}
                    >
                        {invalid}
                    </div>
                }
                <ControlGroup
                    label="Node Name"
                >
                    <InputField
                        value={node.nodeName || ''}
                        onChange={onNodeNameChange}
                        disabled={readonly}
                    />
                </ControlGroup>
                {
                    valueInternals.map(vi => renderValue(vi))
                }
                {
                    valueInputs.length > 0 &&
                    <Divider />
                }
                {
                    valueInputs.map(vi => renderValue(vi))
                }
                {
                    valueOutputs.length > 0 &&
                    <Divider />
                }
                {
                    valueOutputs.map(vo => renderValue(vo))
                }
                {
                    children
                }
            </div>
        </div>
    );    
}