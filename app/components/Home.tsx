import React from 'react';
import { Map } from 'react-amap';
import CardPanel from './CardPanel';

export default function Home() {
  return (
    <>
      <Map amapkey={process.env.AMAPKEY} protocol={'https://'} />
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
