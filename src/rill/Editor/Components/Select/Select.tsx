import React, { useContext, useState, useRef, useEffect } from 'react';

import { BaseProps } from '../props';
import { scrollIntoView, mergeClasses } from '../utils';
import { InputField } from '../InputFIeld';
import { Menu } from '../Menu';
import { ThemeContext, Theme } from '../../theme';
import { Keys } from '../keys';
import { MenuItem } from '../MenuItem';

export interface SelectItemRendererProps<I> extends BaseProps {
    item: I;
    onClick: (event: React.MouseEvent) => void;
}

export interface SelectProps<I> {
    items: I[];
    defaultSelected?: I;
    itemPredicate?: (item: I, filter: string) => boolean;
    itemRenderer?: React.FunctionComponent<SelectItemRendererProps<I>> | React.ClassicComponentClass<SelectItemRendererProps<I>>;
    onSelect?: (item: I) => void;

    placeholder?: JSX.Element;
}

function defaultItemRenderer<I>(props: SelectItemRendererProps<I>) {
    return (
        <span
            onClick={props.onClick}
        >
            {
                `${props.item}`
            }
        </span>
    );
}

export function Select<I>(props: SelectProps<I>) {
    const {
        items,
        placeholder,
        itemPredicate,
        itemRenderer: ItemRenderer = defaultItemRenderer,
        onSelect,
        defaultSelected
    } = props;

    const theme = useContext<Theme>(ThemeContext).classes;
    const menuRef = useRef<HTMLUListElement>(null);
    const [filter, setFilter] = useState('');
    const [activeItem, setActiveItem] = useState(() => defaultSelected ? items.findIndex(i => i === defaultSelected) : -1);
    const [filtered, setFiltered] = useState(items);

    function onFilterChange(event: React.FormEvent<HTMLInputElement>) {
        setFilter(event.currentTarget.value);
    }

    function handleClick(item: I) {
        return (event: React.SyntheticEvent) => {
            event.preventDefault();
            event.stopPropagation();
            if (onSelect) {
                onSelect(item);
            }
        };
    }

    function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.which === Keys.Up) {
            if (activeItem > 0) {
                setActiveItem(activeItem - 1);
            } else {
                setActiveItem(filtered.length - 1);
            }
        } else
        if (event.which === Keys.Down) {
            if (activeItem < filtered.length - 1) {
                setActiveItem(activeItem + 1);
            } else {
                setActiveItem(0);
            }
        } else
        if (event.which === Keys.Enter) {
            const item = filtered[activeItem];
            if (item && onSelect) {
                onSelect(item);
            }
        }
    }

    useEffect(() => {
        const res = !itemPredicate ?
            items :
            items.filter(i => itemPredicate(i, filter));

        setFiltered(res);
        if (activeItem >= res.length) {
            setActiveItem(0);
        }
    }, [items, itemPredicate, filter, activeItem]);

    useEffect(() => {
        scrollIntoView(menuRef.current, activeItem);
    }, [activeItem, menuRef]);

    return (
        <>
            {
                itemPredicate &&
                <InputField
                    value={filter}
                    onChange={onFilterChange}
                    autoFocus={true}
                    placeholder="Filter..."
                    tabIndex={1}
                    fill={true}
                    style={{
                        marginBottom: 10
                    }}
                    onKeyDown={onKeyDown}
                />
            }            
            {
                filtered.length > 0 ?
                    <Menu
                        menuRef={menuRef}
                        style={{
                            flex: 1,
                            overflow: 'auto'
                        }}
                    >
                        {
                            filtered.map((i, ii) => {
                                const classes = mergeClasses({
                                    [theme.active]: ii === activeItem
                                });
                                const clickHandler = handleClick(i);
                                return (
                                    <MenuItem
                                        key={ii}
                                        onClick={clickHandler}
                                        className={classes}
                                    >
                                        <ItemRenderer
                                            item={i}
                                            onClick={clickHandler}
                                        />
                                    </MenuItem>
                                );
                            })
                        }
                    </Menu>
                :
                    placeholder ||
                    <span className={theme.textMuted}>
                        Nothing
                    </span>
            }
        </>
    );
}
