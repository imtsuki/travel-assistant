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
import MUIDataTable from 'mui-datatables';
import React, { useState } from 'react';
import {
  atom,
  useSetRecoilState,
  useRecoilValue,
  useRecoilState,
} from 'recoil';

import PlannerWorker from '../algorithm/planner.worker';
import cities from '../data/cities.json';
import routes from '../data/routes.json';
import { logItemsState, log } from '../logging';

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
      return `乘坐飞机 - 每小时风险值 9`;
    case 'TRAIN':
      return `乘坐火车 - 每小时风险值 5`;
    case 'BUS':
      return `乘坐汽车 - 每小时风险值 2`;
    case 'WAIT':
      return '在此城市候车';
    case 'ARRIVED':
      return `到达目的地`;
    default:
      return '未知';
  }
}

function getStepTitle(cityName: string) {
  let city = cities.find((c) => c.name === cityName);
  if (city) {
    let risk;
    switch (city.risk) {
      case 'LOW':
        risk = '低风险';
        break;
      case 'MEDIUM':
        risk = '中风险';
        break;
      case 'HIGH':
        risk = '高风险';
        break;
      default:
        risk = '未知风险';
    }
    return `${city.name} - ${risk}`;
  } else {
    return cityName;
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
  const [risk, setRisk] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [logItems, setLogItems] = useRecoilState(logItemsState);

  const [cityListOpen, setCityListOpen] = useState(false);
  const [timetableOpen, setTimetableOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);

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

    setLogItems((logItems) => [
      ...logItems,
      log(
        `开始旅行规划（${strategy}）：始发城市${source}，到达城市${destination}`
      ),
    ]);

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

      setLogItems((logItems) => [
        ...logItems,
        log(`规划算法返回了 ${plans.length} 个可行方案`),
      ]);

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
          setLogItems((logItems) => [
            ...logItems,
            log(
              `根据${strategy}，选择了风险值为 ${plan.risk} 的方案：[${plan.plan}]`
            ),
          ]);
          setPolyline(polylines);
          setTiming(timing);
          setSteps(plan.plan);
          setRisk(plan.risk);
          setExpanded(true);
          return;
        }
      }
      setPolyline([]);
      setTiming([]);
      setSteps([]);
      setRisk(0);
      setExpanded(false);
      setDialogOpen(true);
    };
  };

  const tableOptions = {
    print: false,
    rowsPerPage: 5,
    rowsPerPageOptions: [5, 15, 100],
    textLabels: {
      body: {
        noMatch: '没有匹配数据',
        toolTip: '排序',
        columnHeaderTooltip: (column: any) => `按照${column.label}排序`,
      },
      pagination: {
        next: '下一页',
        previous: '上一页',
        rowsPerPage: '每页数据行数',
        displayRows: 'of',
      },
      toolbar: {
        search: '搜索',
        downloadCsv: '导出 CSV 文件',
        viewColumns: '查看列',
        filterTable: '筛选',
      },
      filter: {
        all: '(全部)',
        title: '筛选',
        reset: '重置',
      },
      viewColumns: {
        title: '查看列',
      },
      selectedRows: {
        text: '行被选择',
        delete: '删除',
        deleteAria: '删除所选列',
      },
    },
  };

  return (
    <Card className={classes.root} elevation={4}>
      <CardContent>
        <AssistantOutlinedIcon />
        <Typography variant="h6" gutterBottom>
          COVID-19 Travel Assistant
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          数据结构课程设计
        </Typography>
        <Button onClick={() => setCityListOpen(true)}>查看城市列表</Button>
        <Button onClick={() => setTimetableOpen(true)}>查看时刻表</Button>
        <Button onClick={() => setLogOpen(true)}>查看日志</Button>

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
          <Typography>该旅行方案总风险值：{risk}</Typography>
          <Stepper orientation="vertical" activeStep={activeStep}>
            {steps.map((step) => (
              <Step key={step}>
                <StepLabel>{`${getStepTitle(step[0][0])} - ${
                  step[0][1]
                }:00`}</StepLabel>
                <StepContent TransitionProps={{ in: true }}>
                  <Typography>{getStepContent(step)}</Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Collapse>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>没有搜寻到可行的旅行规划方案</DialogTitle>
        <DialogContent>
          <DialogContentText>
            请检查输入数据是否有效，或改变策略，放宽条件，并重试。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogOpen(false)}
            color="primary"
            autoFocus
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={cityListOpen} onClose={() => setCityListOpen(false)}>
        <DialogContent>
          <MUIDataTable
            title="城市列表"
            columns={[
              { label: '城市名称', name: 'name' },
              { label: '风险等级', name: 'risk' },
            ]}
            data={cities}
            options={{
              ...tableOptions,
              downloadOptions: { filename: 'cities.csv' },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCityListOpen(false)}
            color="primary"
            autoFocus
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={timetableOpen} onClose={() => setTimetableOpen(false)}>
        <DialogContent>
          <MUIDataTable
            title="旅行时刻表"
            columns={[
              { label: '始发城市', name: 'from' },
              { label: '到达城市', name: 'to' },
              { label: '始发时间', name: 'startTime' },
              { label: '到达时间', name: 'endTime' },
              { label: '交通工具类型', name: 'type' },
            ]}
            data={routes}
            options={{
              ...tableOptions,
              downloadOptions: { filename: 'timetable.csv' },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setTimetableOpen(false)}
            color="primary"
            autoFocus
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={logOpen} onClose={() => setLogOpen(false)}>
        <DialogContent>
          <MUIDataTable
            title="系统日志"
            columns={[
              { label: '时间戳', name: 'timestamp' },
              { label: '消息', name: 'message' },
            ]}
            data={logItems}
            options={{
              ...tableOptions,
              downloadOptions: { filename: 'log.csv' },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogOpen(false)} color="primary" autoFocus>
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
