import React, { useContext } from 'react';

import { Theme, ThemeContext } from '../theme';

export const Filters = React.memo(() => {
    const theme = useContext<Theme>(ThemeContext).filters.shadows;
    return (
        <>
            {
                Object.keys(theme).map(key => {
                    const f = theme[key];
                    return (
                        <filter
                            key={key}
                            id={key}
                            x={f.x}
                            y={f.y}
                            width={f.width}
                            height={f.height}
                            filterUnits={f.filterUnits}
                        >
                            <feDropShadow
                                dx={f.dx}
                                dy={f.dy}
                                stdDeviation={f.stdDeviation}
                                floodColor={f.floodColor}
                                floodOpacity={f.floodOpacity}
                            />
                        </filter>  
                    ) 
                })
            }
        </>
    ); 
});
