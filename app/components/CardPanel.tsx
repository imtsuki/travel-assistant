import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import { red } from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import Step from '@material-ui/core/Step';
import StepContent from '@material-ui/core/StepContent';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import AssistantOutlinedIcon from '@material-ui/icons/AssistantOutlined';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import clsx from 'clsx';
import React from 'react';

import MyWorker from './my.worker';

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
    avatar: {
      backgroundColor: red[500],
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

function getStepContent(step: number) {
  switch (step) {
    case 0:
      return `CA-2092 航班 - 耗时 2 小时`;
    case 1:
      return 'G2074 次列车 - 耗时 5 小时';
    case 2:
      return `公共汽车 - 耗时 39 分钟`;
    default:
      return '未知交通工具';
  }
}

export default function CardPanel() {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    const worker = new MyWorker();
    worker.postMessage({ message: 'Message from main thread' });

    worker.onmessage = function (event: any) {
      console.log('Received message from worker thread', event.data);
    };
    setExpanded(!expanded);
  };

  const steps = ['北京市', '上海市', '广州市', '深圳市', '杭州市'];

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
          <TextField id="from-where" label="输入起点" variant="outlined" />
          <TextField id="to-where" label="输入终点" variant="outlined" />
        </form>

        <Typography variant="body2" color="textSecondary" component="p">
          城市之间有各种交通工具（汽车、火车和飞机）相连，有些城市之间无法直达，需要途径中转城市。某旅客于某一时刻向系统提出旅行要求。考虑在当前
          COVID-19
          疫情环境下，各个城市的风险程度不一样，分为低风险、中风险和高风险三种。系统根据风险评估，为该旅客设计一条符合旅行策略的旅行线路并输出；系统能查询当前时刻旅客所处的地点和状态（停留城市/所在交通工具），具体旅行策略见后。
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton
          className={clsx(classes.expand, {
            [classes.expandOpen]: expanded,
          })}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </IconButton>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Stepper orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent TransitionProps={{ in: true }}>
                  <Typography>{getStepContent(index)}</Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Collapse>
    </Card>
  );
}
