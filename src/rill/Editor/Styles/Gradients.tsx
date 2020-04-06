import React, { useContext } from 'react';
import { Theme, ThemeContext } from '../theme';

export const Gradients = React.memo(() => {
    const theme = useContext<Theme>(ThemeContext).filters.gradients;

    return (
        <>
            {
                Object.keys(theme).map(key => {
                    const f = theme[key];
                    return (
                        <linearGradient key={key} id={key} x1={`${f.x1}%`} y1={`${f.y1}%`} x2={`${f.x2}%`} y2={`${f.y2}%`}>
                            {
                                f.stops.map((s, si) =>
                                    <stop key={si} offset={`${s.offset}%`} stopColor={s.stopColor} />
                                )
                            }
                        </linearGradient>
                    ) 
                })
            }
        </>
    ); 
});

