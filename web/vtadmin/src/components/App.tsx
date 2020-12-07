import * as React from 'react';
import { BrowserRouter as Router, Redirect, Switch, Route } from 'react-router-dom';
import { WorkflowDetails } from '../routes/WorkflowDetails';
import { Workflows } from '../routes/Workflows';

import style from './App.module.scss';

export const App = () => {
    return (
        <Router>
            <div className={style.container}>
                <header className={style.header}>
                    <h1>VTAdmin</h1>
                </header>

                <Switch>
                    <Route exact path="/vrep/streams">
                        <Workflows />
                    </Route>

                    <Route path="/vrep/streams/:cluster/:id">
                        <WorkflowDetails />
                    </Route>

                    <Redirect from="/" to="/vrep/streams" exact />
                </Switch>
            </div>
        </Router>
    );
};
