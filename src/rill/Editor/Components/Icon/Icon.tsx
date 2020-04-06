import React, { useContext } from 'react';

import { IconName, Icons } from '../Icons';
import { Theme, ThemeContext } from '../../theme';
import { BaseProps } from '../props';
import { mergeClasses } from '../utils';

export interface IconProps extends BaseProps {
    icon?: IconName | React.ReactNode;
    color?: string;
    title?: string;
    iconSize?: number;
}

export const Icon = React.memo((props: React.PropsWithChildren<IconProps>) => {
    const {
        icon,
        color,
        title,
        iconSize = 16,
        children,
        className,
        style
    } = props;

    const theme = useContext<Theme>(ThemeContext).classes;
    function renderSVG(size: number, paths: string[]) {
        const viewBox = `0 0 ${size} ${size}`;
        return (
            <svg fill={color} data-icon={icon} width={size} height={iconSize} viewBox={viewBox}>
                {title && <desc>{title}</desc>}
                {
                    paths.map((d, i) => <path key={i} d={d} fillRule="evenodd" />)
                }
            </svg>
        );
    }

    return (
        <span
            className={mergeClasses(theme.icon, className)}
            style={style}
        >
            {typeof icon === 'string' ? renderSVG(iconSize, Icons[icon as IconName]) : icon}
            {children}
        </span>
    );
});
