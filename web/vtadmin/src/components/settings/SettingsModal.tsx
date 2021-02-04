import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { Modal } from '../lib/modal/Modal';
import style from './SettingsModal.module.scss';

export const SettingsModal = () => {
    const history = useHistory();
    const location = useLocation();

    const onClose = () => {
        const background = location.state && (location.state as any).background;
        history.push(background);
    };

    return (
        <Modal className={style.modal} onRequestClose={onClose} title="Settings">
            <h3>Theme</h3>
            <p>Dark and light</p>
            <h3>Time Zone</h3>
            <p> I am the settings modal</p>
        </Modal>
    );
};
