import Chip from '@material-ui/core/Chip';
import Fab from '@material-ui/core/Fab';
import { useTheme } from '@material-ui/core/styles';
import Zoom from '@material-ui/core/Zoom';
import AlarmIcon from '@material-ui/icons/Alarm';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import PauseIcon from '@material-ui/icons/Pause';
import PersonPinCircleTwoToneIcon from '@material-ui/icons/PersonPinCircleTwoTone';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import React, { useState } from 'react';
import { Map, Markers, Polyline, Marker } from 'react-amap';
import { useBoolean, useInterval } from 'react-use';
import { atom, useRecoilValue, useSetRecoilState } from 'recoil';

import cities from '../data/cities.json';
import { logItemsState, log } from '../logging';

import CardPanel, {
  polylineState,
  timingState,
  activeStepState,
} from './CardPanel';

/**
 * 当前模拟坐标的状态
 */
export const positionState = atom<{ longitude: number; latitude: number }>({
  key: 'positionState',
  default: { longitude: 120, latitude: 35 },
});

/**
 * 程序主界面。
 */
export default function Home() {
  const theme = useTheme();

  const polyline = useRecoilValue(polylineState);
  const timing = useRecoilValue(timingState);
  const setActiveStep = useSetRecoilState(activeStepState);
  const [time, setTime] = useState(6);

  const [delay, setDelay] = useState(16);
  const [position, setPosition] = useState({ longitude: 110, latitude: 35 });

  const [isRunning, toggleIsRunning] = useBoolean(false);

  const setLogItems = useSetRecoilState(logItemsState);

  useInterval(
    () => {
      setTime(time + delay / 1000);
      for (let i = 0; i < timing.length - 1; i++) {
        if (time >= timing[i] && time < timing[i + 1]) {
          let ratio = (time - timing[i]) / (timing[i + 1] - timing[i]);
          setPosition({
            longitude:
              polyline[i].longitude * (1 - ratio) +
              polyline[i + 1].longitude * ratio,
            latitude:
              polyline[i].latitude * (1 - ratio) +
              polyline[i + 1].latitude * ratio,
          });
          setActiveStep(i);
          return;
        }
      }
      setTime(6);
      toggleIsRunning(false);
      setActiveStep(timing.length);
      setLogItems((logItems) => [...logItems, log(`用户模拟结束`)]);
    },
    isRunning ? delay : null
  );

  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  };

  const getTimeLabel = (time: number) => {
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setSeconds(time * 60 * 60);
    return `当前时间：${date.toTimeString()}`;
  };

  return (
    <>
      <Map
        amapkey={process.env.AMAPKEY}
        version={'2.0'}
        protocol={'https://'}
        plugins={['Scale', 'ToolBar', 'ControlBar']}
        viewMode="3D"
        zoom={5}
        center={
          polyline.length >= 2
            ? [
                (polyline[0].longitude +
                  polyline[polyline.length - 1].longitude) /
                  2 +
                  1,
                (polyline[0].latitude +
                  polyline[polyline.length - 1].latitude) /
                  2,
              ]
            : [120, 35]
        }
      >
        <Markers
          markers={cities}
          render={() => <LocationOnIcon />}
          offset={{ x: -12, y: -24 }}
        />
        <Polyline path={polyline} />
        <Marker
          position={position}
          render={() => <PersonPinCircleTwoToneIcon color="secondary" />}
          // @ts-ignore
          anchor="bottom-center"
        />
      </Map>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          marginLeft: '-200px',
          top: '50px',
        }}
      >
        <Chip
          color="secondary"
          icon={<AlarmIcon />}
          label={getTimeLabel(time)}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          right: '0px',
          top: '0px',
          padding: '30px',
          maxHeight: '100%',
          overflowY: 'scroll',
        }}
      >
        <CardPanel />
      </div>

      {[
        { value: true, icon: <PauseIcon /> },
        { value: false, icon: <PlayArrowIcon /> },
      ].map((fab) => (
        <div
          style={{
            position: 'absolute',
            right: '0px',
            bottom: '0px',
            padding: '50px',
          }}
          key={+fab.value}
        >
          <Zoom
            in={isRunning === fab.value}
            timeout={transitionDuration}
            style={{
              transitionDelay: `${
                isRunning === fab.value ? transitionDuration.exit : 0
              }ms`,
            }}
            unmountOnExit
          >
            <Fab
              color="primary"
              variant="extended"
              aria-label="add"
              onClick={() => {
                setLogItems((logItems) => [
                  ...logItems,
                  log(isRunning ? `用户暂停了模拟` : `用户开始进行模拟`),
                ]);
                toggleIsRunning();
              }}
            >
              {fab.icon}
              {isRunning ? '暂停模拟' : '开始模拟'}
            </Fab>
          </Zoom>
        </div>
      ))}
    </>
  );
}
