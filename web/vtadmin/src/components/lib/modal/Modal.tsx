import cx from 'classnames';
import * as React from 'react';
import ReactModal from 'react-modal';

import { Button } from '../../Button';
import { Icon, Icons } from '../../Icon';

import style from './Modal.module.scss';

type Props = React.PropsWithChildren<{
    className?: string;
    onRequestClose?: any;
    shouldCloseOnEsc?: boolean;
    shouldCloseOnOverlayClick?: boolean;
    title: string;
}>;

ReactModal.setAppElement('#root');

export const Modal = ({
    className,
    children,
    onRequestClose,
    shouldCloseOnEsc = true,
    shouldCloseOnOverlayClick = true,
    title,
}: Props) => {
    return (
        <ReactModal
            className={cx(style.modal, className)}
            isOpen={true}
            onRequestClose={onRequestClose}
            shouldCloseOnEsc={shouldCloseOnEsc}
            shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
        >
            <div className={style.heading}>
                <h4 className={style.title}>{title}</h4>
                <button className={style.close} onClick={onRequestClose}>
                    <Icon className={style.closeIcon} icon={Icons.delete} />
                </button>
            </div>
            <div className={style.content}>{children}</div>
            {/* <div className={style.buttonContainer}>
                <Button secondary>Secondary</Button>
                <Button>Primary</Button>
            </div> */}
        </ReactModal>
    );
};
