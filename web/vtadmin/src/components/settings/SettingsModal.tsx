import * as React from 'react';
import { Link, Redirect, Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom';

import { Modal } from '../lib/modal/Modal';
import style from './SettingsModal.module.scss';

export const SettingsModal = () => {
    const history = useHistory();
    const location = useLocation();
    let { path, url } = useRouteMatch();

    const background = location.state && (location.state as any).background;

    const onClose = () => {
        console.log('closing');
        history.push(background);
    };

    console.log('background', background);

    return (
        <Modal className={style.modal} onRequestClose={onClose} title="Settings">
            <div className={style.container}>
                <div className={style.nav}>
                    <ul>
                        <li>
                            <Link to={{ pathname: `${url}/time`, state: { background } }}>Time Zone</Link>
                        </li>
                        <li>
                            <Link to={{ pathname: `${url}/theme`, state: { background } }}>Theme</Link>
                        </li>
                        <li>
                            <Link to={{ pathname: `${url}/advanced`, state: { background } }}>Advanced</Link>
                        </li>
                    </ul>
                </div>
                <div className={style.content}>
                    <Switch>
                        <Route path={`${path}/time`}>Time</Route>
                        <Route path={`${path}/theme`}>Theme</Route>
                        <Route path={`${path}/advanced`}>Advanced</Route>
                        <Redirect exact from={path} to={{ pathname: `${url}/time`, state: { background } }} />
                    </Switch>
                </div>
            </div>
        </Modal>
    );
};
