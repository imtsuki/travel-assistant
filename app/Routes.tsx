import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import routes from './routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';

export default function Routes() {
  return (
    <App>
      <BrowserRouter>
        <Switch>
          <Route path={routes.HOME} component={HomePage} />
        </Switch>
      </BrowserRouter>
    </App>
  );
}
