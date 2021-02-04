import * as React from 'react';
import { Button } from '../Button';
import { Icon, Icons } from '../Icon';

import style from './Modal.module.scss';

type Props = React.PropsWithChildren<{
    title: string;
}>;

export const Modal = ({ children, title }: Props) => {
    return (
        <div className={style.modal}>
            <div className={style.heading}>
                <h4 className={style.title}>{title}</h4>
                <button className={style.close}>
                    <Icon className={style.closeIcon} icon={Icons.delete} />
                </button>
            </div>
            <div>{children}</div>
            <div className={style.buttonContainer}>
                <Button secondary>Secondary</Button>
                <Button>Primary</Button>
            </div>
        </div>
    );
};
