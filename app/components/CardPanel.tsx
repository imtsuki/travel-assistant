import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Step from '@material-ui/core/Step';
import StepContent from '@material-ui/core/StepContent';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import AssistantOutlinedIcon from '@material-ui/icons/AssistantOutlined';
import React, { useState } from 'react';
import { atom, useSetRecoilState, useRecoilValue } from 'recoil';

import cities from '../data/cities.json';

import PlannerWorker from './planner.worker';

export const polylineState = atom<{ longitude: number; latitude: number }[]>({
  key: 'polylineState',
  default: [],
});

export const timingState = atom<number[]>({
  key: 'timingState',
  default: [],
});

export const activeStepState = atom<number>({
  key: 'activeStepState',
  default: 0,
});

const worker = new PlannerWorker();

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: 345,
    },
    media: {
      height: 0,
      paddingTop: '56.25%',
    },
    expand: {
      transform: 'rotate(0deg)',
      marginLeft: 'auto',
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: 'rotate(180deg)',
    },
    form: {
      '& .MuiTextField-root': {
        boxSizing: 'content-box',
        marginBottom: theme.spacing(1),
        marginTop: theme.spacing(1),
        width: '100%',
      },
    },
  })
);

function getStepContent(step: [[string, number], string]) {
  switch (step[1]) {
    case 'PLANE':
      return `乘坐飞机`;
    case 'TRAIN':
      return `乘坐火车`;
    case 'BUS':
      return `乘坐汽车`;
    case 'WAIT':
      return '在此城市候车';
    case 'ARRIVED':
      return `到达目的地`;
    default:
      return '未知';
  }
}

export default function CardPanel() {
  const classes = useStyles();
  const setPolyline = useSetRecoilState(polylineState);
  const setTiming = useSetRecoilState(timingState);
  const activeStep = useRecoilValue(activeStepState);
  const [expanded, setExpanded] = useState(false);
  const [source, setSource] = useState('北京');
  const [destination, setDestination] = useState('合肥');
  const [strategy, setStrategy] = useState('最少风险策略');
  const [latestTime, setLatestTime] = useState('16:00');
  const [steps, setSteps] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleSourceChange = (event: React.ChangeEvent<{ value: string }>) => {
    setSource(event.target.value);
  };

  const handleDestinationChange = (
    event: React.ChangeEvent<{ value: string }>
  ) => {
    setDestination(event.target.value);
  };

  const handleStrategyChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setStrategy(event.target.value as string);
  };

  const handleLatestTimeChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setLatestTime(event.target.value as string);
  };

  const handleSearchClick = () => {
    let latestHour = 23;
    let tmp = latestTime.match(/^(\d+):(\d+)$/);
    if (tmp) {
      latestHour = parseInt(tmp[1]);
    }

    worker.postMessage({
      source: source,
      destination: destination,
    });

    worker.onmessage = function (event: any) {
      console.log('所有方案', event.data);

      let plans = event.data;
      if (strategy === '限时最少风险策略') {
        plans = plans.filter((plan: any) => {
          return plan.arrivalTime <= latestHour;
        });
      }

      console.log(plans);

      if (plans && plans.length > 0) {
        let plan = plans.reduce((min: any, next: any) => {
          if (min.risk > next.risk) {
            min = next;
          }
          return min;
        });

        console.log(plan);

        let polylines = [];
        let timing = [];
        if (plan) {
          for (let edge of plan.plan) {
            let position = cities.find((city) => city.name === edge[0][0])
              ?.position;
            if (position) {
              polylines.push(position);
              timing.push(edge[0][1]);
            }
          }
          setPolyline(polylines);
          setTiming(timing);
          setSteps(plan.plan);
          setExpanded(true);
          return;
        }
      }
      setPolyline([]);
      setTiming([]);
      setSteps([]);
      setExpanded(false);
      setDialogOpen(true);
    };
  };

  return (
    <Card className={classes.root} elevation={4}>
      <CardContent>
        <AssistantOutlinedIcon />
        <Typography variant="h6" gutterBottom>
          COVID-19 Travel Assistant
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          by imtsuki
        </Typography>
        <form className={classes.form} noValidate autoComplete="off">
          <TextField
            id="source"
            label="输入起点"
            variant="outlined"
            value={source}
            onChange={handleSourceChange}
          />
          <TextField
            id="destination"
            label="输入终点"
            variant="outlined"
            value={destination}
            onChange={handleDestinationChange}
          />
          <Box style={{ marginBottom: '10px' }}>
            <Select
              id="strategy"
              variant="outlined"
              value={strategy}
              onChange={handleStrategyChange}
            >
              <MenuItem value="最少风险策略">最少风险策略</MenuItem>
              <MenuItem value="限时最少风险策略">限时最少风险策略</MenuItem>
            </Select>
            {strategy === '限时最少风险策略' ? (
              <TextField
                id="latestTime"
                label="最晚到达时间"
                variant="outlined"
                type="time"
                value={latestTime}
                onChange={handleLatestTimeChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 3600, // 1 hour
                }}
              />
            ) : (
              ''
            )}
          </Box>

          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearchClick}
            >
              搜寻路径
            </Button>
          </Box>
        </form>
      </CardContent>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Stepper orientation="vertical" activeStep={activeStep}>
            {steps.map((step) => (
              <Step key={step}>
                <StepLabel>{`${step[0][0]} - ${step[0][1]}:00`}</StepLabel>
                <StepContent TransitionProps={{ in: true }}>
                  <Typography>{getStepContent(step)}</Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Collapse>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>没有搜寻到可行的旅行规划方案</DialogTitle>
        <DialogContent>
          <DialogContentText>
            请检查输入数据是否有效，或改变策略，放宽条件，并重试。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary" autoFocus>
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
