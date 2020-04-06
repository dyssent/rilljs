import React, { useContext } from 'react';

import { Theme, ThemeContext } from '../theme';

export const Patterns = React.memo(() => {
    const theme = useContext<Theme>(ThemeContext).canvas.grid;
    const largeStep = theme.step * 10;
    return (
        <>
            <pattern id="smallGrid" width={theme.step} height={theme.step} patternUnits="userSpaceOnUse">
                <path d={`M ${theme.step} 0 L 0 0 0 ${theme.step}`} className={theme.small}/>
            </pattern>
            <pattern id="grid" width={largeStep} height={largeStep} patternUnits="userSpaceOnUse">
                <rect width={largeStep} height={largeStep} fill="url(#smallGrid)"/>
                <path d={`M ${largeStep} 0 L 0 0 0 100`} className={theme.large}/>
            </pattern>
        </>
    ); 
});
