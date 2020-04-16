import React, { CSSProperties, useState, useRef, useLayoutEffect, useContext, useMemo } from 'react';
import { Theme, ThemeContext } from '../../theme';
import { IntentProps, BaseProps } from '../props';
import { mergeClasses } from '../utils';

const DEFAULT_SIDE_ELEMENT_WIDTH = 10;

export interface ControlledProps {
    defaultValue?: string;
    onChange?: React.FormEventHandler<HTMLElement>;
    value?: string | number;
}

export interface InputFieldProps extends ControlledProps, IntentProps, BaseProps {
    disabled?: boolean;
    fill?: boolean;
    leftElement?: JSX.Element;
    placeholder?: string;
    rightElement?: JSX.Element;
    round?: boolean;
    type?: string;
    ref?: React.RefObject<HTMLInputElement>;
    autoFocus?: boolean;
    tabIndex?: number;
    checked?: boolean;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function InputField(props: InputFieldProps) {
    const {
        fill,
        intent,
        round,
        className,
        leftElement,
        rightElement,
        disabled,

        type = 'text',
        ref,
        defaultValue,
        onChange,
        value,
        autoFocus,
        tabIndex,
        placeholder,
        onKeyDown,
        checked
    } = props;

    const theme = useContext<Theme>(ThemeContext).classes;
    const leftElRef = useRef<HTMLSpanElement>(null);
    const rightElRef = useRef<HTMLSpanElement>(null);
    const [rightElementWidth, setRightElementWidth] = useState(DEFAULT_SIDE_ELEMENT_WIDTH);
    const [leftElementWidth, setLeftElementWidth] = useState(DEFAULT_SIDE_ELEMENT_WIDTH);

    const classes = useMemo(() => {
        return mergeClasses(
            theme.inputField,
            intent ? theme.intents[intent] : undefined,
            {
                [theme.disabled]: disabled,
                [theme.fill]: fill,
                [theme.round]: round
            },
            className
        );
    }, [theme, className, intent, disabled, fill, round]);

    const style: CSSProperties = {
        ...props.style,
        paddingRight: rightElementWidth
    };

    useLayoutEffect(() => {
        if (rightElRef.current &&
            Math.abs(rightElRef.current.clientWidth - rightElementWidth) > 2) {
            setRightElementWidth(rightElRef.current.clientWidth);
        }

        if (leftElRef.current &&
            Math.abs(leftElRef.current.clientWidth - leftElementWidth) > 2) {
            setLeftElementWidth(leftElRef.current.clientWidth);
        }
    }, [leftElRef, rightElRef, leftElementWidth, rightElementWidth]);

    function renderLeftElement() {
        if (!leftElement) {
            return undefined;
        }

        return (
            <span ref={leftElRef}>
                {leftElement}
            </span>
        );
    }

    function renderRightElement() {
        if (!rightElement) {
            return undefined;
        }

        return (
            <span ref={rightElRef}>
                {rightElement}
            </span>
        );
    }


    return (
        <div className={classes}>
            {
                renderLeftElement()
            }
            <input
                type={type}
                style={style}
                ref={ref}
                className={theme.input}
                defaultValue={defaultValue}
                value={value}
                disabled={disabled}
                onChange={onChange}
                autoFocus={autoFocus}
                tabIndex={tabIndex}
                placeholder={placeholder}
                onKeyDown={onKeyDown}
                checked={checked}
            />
            {
                renderRightElement()
            }
        </div>
    );
}
