import * as React from 'react';
import ReactModal from 'react-modal';

import { Button } from '../Button';
import { Icon, Icons } from '../Icon';

import style from './Modal.module.scss';

type Props = React.PropsWithChildren<{
    title: string;
}>;

ReactModal.setAppElement('#root');

export const Modal = ({ children, title }: Props) => {
    return (
        <ReactModal className={style.modal} isOpen={true}>
            <div className={style.heading}>
                <h4 className={style.title}>{title}</h4>
                <button className={style.close}>
                    <Icon className={style.closeIcon} icon={Icons.delete} />
                </button>
            </div>
            <div className={style.content}>{children}</div>
            <div className={style.buttonContainer}>
                <Button secondary>Secondary</Button>
                <Button>Primary</Button>
            </div>
        </ReactModal>
    );
};
