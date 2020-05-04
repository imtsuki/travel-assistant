import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import App from './containers/App';
import HomePage from './containers/HomePage';
import routes from './routes.json';

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
