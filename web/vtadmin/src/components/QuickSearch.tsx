import * as React from 'react';

import style from './QuickSearch.module.scss';

export const QuickSearch = () => {
    return <input className={style.input} placeholder="Quick find" type="text" />;
};
