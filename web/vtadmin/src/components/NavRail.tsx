import * as React from 'react';
import { NavLink } from 'react-router-dom';

import style from './NavRail.module.scss';
import logo from '../img/vitess-icon-color.svg';

export const NavRail = () => {
    return (
        <div className={style.container}>
            <div className={style.logoContainer}>
                <NavLink exact activeClassName={style.active} to="/">
                    <img className={style.logo} src={logo} alt="logo" height={49} />
                </NavLink>
            </div>

            <div className={style.navContainer}>
                <div className={style.navSection}>
                    <ul className={style.navList}>
                        <li>
                            <NavLink exact activeClassName={style.active} to="/dashboard">
                                <div className={style.linkRow}>
                                    <span>Dashboard</span>
                                    <div className={style.badge}>2</div>
                                </div>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink exact activeClassName={style.active} to="/workflows">
                                <div className={style.linkRow}>
                                    <span>Workflows</span>
                                    <div className={style.badge}>420</div>
                                </div>
                            </NavLink>
                        </li>
                    </ul>
                </div>

                <hr />

                <div className={style.navSection}>
                    <ul className={style.navList}>
                        <li>
                            <NavLink exact activeClassName={style.active} to="/clusters">
                                <div className={style.linkRow}>
                                    <span>Clusters</span>
                                    <div className={style.badge}>7</div>
                                </div>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink exact activeClassName={style.active} to="/gates">
                                <div className={style.linkRow}>
                                    <span>Gates</span>
                                    <div className={style.badge}>86</div>
                                </div>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink exact activeClassName={style.active} to="/keyspaces">
                                <div className={style.linkRow}>
                                    <span>Keyspaces</span>
                                    <div className={style.badge}>34</div>
                                </div>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink exact activeClassName={style.active} to="/schemas">
                                <div className={style.linkRow}>
                                    <span>Schemas</span>
                                    <div className={style.badge}>946</div>
                                </div>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink exact activeClassName={style.active} to="/tablets">
                                <div className={style.linkRow}>
                                    <span>Tablets</span>
                                    <div className={style.badge}>280</div>
                                </div>
                            </NavLink>
                        </li>
                    </ul>
                </div>

                <hr />

                <div className={style.navSection}>
                    <ul className={style.navList}>
                        <li>
                            <NavLink exact activeClassName={style.active} to="/">
                                VTExplain
                            </NavLink>
                        </li>
                        <li>
                            <NavLink exact activeClassName={style.active} to="/">
                                Settings
                            </NavLink>
                        </li>
                    </ul>
                </div>

                <div className={style.navFooter}>
                    <ul className={style.navList}>
                        <li>
                            <NavLink exact activeClassName={style.active} to="/">
                                Help
                            </NavLink>
                        </li>
                        <li>
                            <NavLink exact activeClassName={style.active} to="/">
                                Shortcuts
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
