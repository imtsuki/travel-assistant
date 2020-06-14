import CssBaseline from '@material-ui/core/CssBaseline';
import React from 'react';
import { hot } from 'react-hot-loader/root';
import { RecoilRoot } from 'recoil';

import Routes from './Routes';

const App = () => (
  <RecoilRoot>
    <CssBaseline />
    <Routes />
  </RecoilRoot>
);

export default hot(App);
