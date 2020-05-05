import LocationOnIcon from '@material-ui/icons/LocationOn';
import React from 'react';
import { Map, Markers } from 'react-amap';

import city from '../data/city.json';

import CardPanel from './CardPanel';

export default function Home() {
  return (
    <>
      <Map
        amapkey={process.env.AMAPKEY}
        version={'2.0'}
        protocol={'https://'}
        plugins={['Scale', 'ToolBar', 'ControlBar']}
        viewMode="3D"
      >
        <Markers
          protocol={'https://'}
          markers={city}
          render={() => <LocationOnIcon />}
          offset={{ x: -12, y: -24 }}
        />
      </Map>
      <div
        style={{
          position: 'absolute',
          right: '0px',
          top: '0px',
          padding: '30px',
          boxSizing: 'border-box',
          maxHeight: '100%',
          overflowY: 'scroll',
        }}
      >
        <CardPanel />
      </div>
    </>
  );
}
