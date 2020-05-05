import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';

import Home from './components/Home';
import routes from './data/routes.json';

export default function Routes() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path={routes.HOME} component={Home} />
      </Switch>
    </BrowserRouter>
  );
}
