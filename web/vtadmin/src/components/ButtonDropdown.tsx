import React from 'react';
import { Popover } from 'react-tiny-popover';
import { Button } from './Button';

import style from './ButtonDropdown.module.scss';
import { Icon, Icons } from './Icon';

interface Props {
    label: string;
}

export const ButtonDropdown: React.FunctionComponent<Props> = ({ children, label }) => {
    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    const onClick = () => {
        setIsOpen(!isOpen);
    };

    const content = <div className={style.popover}>{children}</div>;

    return (
        <Popover
            content={content}
            isOpen={isOpen}
            onClickOutside={() => setIsOpen(false)}
            positions={['bottom', 'right']}
        >
            <div>
                <Button className={style.button} onClick={onClick} secondary size="large" type="button">
                    {label} <Icon className={style.icon} icon={Icons.chevronDown} />
                </Button>
            </div>
        </Popover>
    );
};
