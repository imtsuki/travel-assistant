import React from 'react';
import { Map } from 'react-amap';
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
      />
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
