import * as React from 'react';
import { Link, Redirect, Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom';

import { Modal } from '../lib/modal/Modal';
import { TextInput } from '../TextInput';
import style from './SettingsModal.module.scss';

export const SettingsModal = () => {
    const history = useHistory();
    const location = useLocation();
    let { path, url } = useRouteMatch();

    const background = location.state && (location.state as any).background;

    const onClose = () => {
        history.push(background);
    };

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
                        <Route path={`${path}/time`}>
                            <div>
                                <div style={{ marginBottom: 24 }}>
                                    <label>
                                        <strong>Primary time zone</strong>
                                        <p>Set your primary time zone, which is displayed by default.</p>
                                        <TextInput />
                                    </label>
                                </div>

                                <div style={{ marginBottom: 24 }}>
                                    <label>
                                        <strong>Secondary time zone</strong>
                                        <p>Set your primary time zone, which is displayed by default.</p>
                                        <TextInput />
                                    </label>
                                </div>
                            </div>
                        </Route>
                        <Route path={`${path}/theme`}></Route>
                        <Route path={`${path}/advanced`}>Advanced</Route>
                        <Redirect exact from={path} to={{ pathname: `${url}/time`, state: { background } }} />
                    </Switch>
                </div>
            </div>
        </Modal>
    );
};
