import React, { useContext } from 'react';
import { ControlProps, Control } from './Control';
import { Theme, ThemeContext } from '../../theme';

export interface CheckboxProps extends ControlProps {
    // defaultIndeterminate?: boolean;
    // indeterminate?: boolean;
}

export function Checkbox(props: CheckboxProps) {
    const {
        onChange,
        ...rest
    } = props;

    const theme = useContext<Theme>(ThemeContext).classes.controls;

    // const [indeterminate, setIndeterminate] = useState(props.indeterminate || props.defaultIndeterminate || false);
    // useEffect(() => {
    //     if (typeof indeterminate !== 'undefined') {
    //         setIndeterminate(indeterminate);
    //     }
    // }, [props.indeterminate]);

    return (
        <Control
            {...rest}
            type="checkbox"
            onChange={onChange}
            typeClassName={theme.checkbox}
        />
    );
}
