import * as React from 'react';
import cx from 'classnames';

import style from './Button.module.scss';
import { Icon, Icons } from './Icon';

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    className?: string;
    icon?: Icons;
    secondary?: boolean;
    size?: 'large' | 'medium' | 'small';
}

export const Button = React.forwardRef(
    ({ children, className, icon, ref, secondary, size = 'medium', type = 'button', ...props }: Props) => {
        const buttonClass = cx(className, style.button, {
            [style.secondary]: !!secondary,
            [style.sizeLarge]: size === 'large',
            [style.sizeSmall]: size === 'small',
            [style.withIcon]: !!icon,
        });

        return (
            <button ref={ref} {...props} className={buttonClass} type={type}>
                {icon && <Icon className={style.icon} icon={icon} />}
                {children}
            </button>
        );
    }
);
