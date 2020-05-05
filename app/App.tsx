import CssBaseline from '@material-ui/core/CssBaseline';
import React from 'react';
import { hot } from 'react-hot-loader/root';

import Routes from './Routes';

const App = () => (
  <>
    <CssBaseline />
    <Routes />
  </>
);

export default hot(App);
