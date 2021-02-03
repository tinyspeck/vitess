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
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';

import style from './App.module.scss';
import { Tablets } from './routes/Tablets';
import { Debug } from './routes/Debug';
import { NavRail } from './NavRail';
import { Error404 } from './routes/Error404';
import { TextInput } from './TextInput';
import { Icons } from './Icon';

export const App = () => {
    return (
        <Router>
            <div className={style.container}>
                <div className={style.navContainer}>
                    <NavRail />
                </div>

                <div className={style.mainContainer}>
                    <div className={style.searchContainer}>
                        <div className={style.content}>
                            <TextInput iconLeft={Icons.search} size="large" placeholder="Search for anything" />
                        </div>
                    </div>
                    <div className={style.routeContainer}>
                        <div className={style.content}>
                            <Switch>
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
                        </div>
                    </div>
                </div>
            </div>
        </Router>
    );
};
