import * as React from 'react';
import { NavLink } from 'react-router-dom';
import style from './Tabs.module.scss';

export const Tabs = (props: { children: any[] | any }) => {
    return <div className={style.tabs}>{props.children}</div>;
};

export const Tab = (props: { children: React.ReactChild; count?: number | null | undefined; to: string }) => {
    return (
        <NavLink activeClassName={style.active} className={style.tab} to={props.to}>
            <span>{props.children}</span>
            {typeof props.count === 'number' && <span className={style.count}>{props.count}</span>}
        </NavLink>
    );
};
