import CssBaseline from '@material-ui/core/CssBaseline';
import React from 'react';
import { hot } from 'react-hot-loader/root';
import { RecoilRoot } from 'recoil';

import Home from './components/Home';

const App = () => (
  <RecoilRoot>
    <CssBaseline />
    <Home />
  </RecoilRoot>
);

export default hot(App);
