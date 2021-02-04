/**
 * Copyright 2021 The Vitess Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as React from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';

import style from './App.module.scss';
import { Tablets } from './routes/Tablets';
import { Debug } from './routes/Debug';
import { NavRail } from './NavRail';
import { Error404 } from './routes/Error404';
import { SettingsModal } from './settings/SettingsModal';

export const App = () => {
    const location = useLocation();

    // This piece of state is set when one of the
    // gallery links is clicked. The `background` state
    // is the location that we were at when one of
    // the gallery links was clicked. If it's there,
    // use it as the location for the <Switch> so
    // we show the gallery in the background, behind
    // the modal.
    let background = location.state && (location.state as any).background;

    return (
        <div className={style.container}>
            <div className={style.navContainer}>
                <NavRail />
            </div>

            <div className={style.mainContainer}>
                <Switch location={background || location}>
                    <Route path="/tablets">
                        <Tablets />
                    </Route>

                    <Route path="/debug">
                        <Debug />
                    </Route>

                    <Redirect exact from="/" to="/tablets" />

                    <Route>
                        <Error404 />
                    </Route>
                </Switch>

                {background && <Route path="/settings" children={<SettingsModal />} />}
            </div>
        </div>
    );
};
