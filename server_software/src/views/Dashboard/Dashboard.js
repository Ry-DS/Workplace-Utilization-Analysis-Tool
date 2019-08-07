import React, {Component} from 'react';
import {Bar, Line} from 'react-chartjs-2';
import {
  Badge,
  Button,
  ButtonGroup,
  ButtonToolbar,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Progress,
  Row,
} from 'reactstrap';
import {CustomTooltips} from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import {getStyle, hexToRgba} from '@coreui/coreui/dist/js/coreui-utilities'
import DashboardCard from "./DashboardCard";
//data stuff
import axios from 'axios';
import MONITOR_TYPE from '../../utils/monitorTypes';
import toast from 'toasted-notes'
import 'toasted-notes/src/styles.css';
import './../../scss/flatpickr-bgis.scss'

import Flatpickr from 'react-flatpickr'


//fetch color themes from css
const brandDark = getStyle('--theme-dark');
const brandLight = getStyle('--theme-light');
const brandNorm = getStyle('--theme-norm');
const brandBland = getStyle('--theme-bland');
const times = ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm',
  '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'];


const freeProjectorsCardOpts = {
  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        display: false,
      }],
    yAxes: [
      {
        display: false,
      }],
  },
  elements: {
    line: {
      borderWidth: 2,
    },
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 4,
    },
  },
};
const freeLaptopCardOpts = {...freeProjectorsCardOpts};
const freeDeskMonitorsCardOpts = {...freeProjectorsCardOpts};
const employeesOnlineCardOpts = {
  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        display: false,
        barPercentage: 0.6,
      }],
    yAxes: [
      {
        display: false,
      }],
  },
};

// sparkline charts
const sparkLineChartData = [
  {
    data: [35, 23, 56, 22, 97, 23, 64],
    label: 'New Clients',
  },
  {
    data: [65, 59, 84, 84, 51, 55, 40],
    label: 'Recurring Clients',
  },
  {
    data: [35, 23, 56, 22, 97, 23, 64],
    label: 'Pageviews',
  },
  {
    data: [65, 59, 84, 84, 51, 55, 40],
    label: 'Organic',
  },
  {
    data: [78, 81, 80, 45, 34, 12, 40],
    label: 'CTR',
  },
  {
    data: [1, 13, 9, 17, 34, 41, 38],
    label: 'Bounce Rate',
  },
];

const makeSparkLineData = (dataSetNo, variant) => {
  const dataset = sparkLineChartData[dataSetNo];
  const data = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        backgroundColor: 'transparent',
        borderColor: variant ? variant : '#c2cfd6',
        data: dataset.data,
        label: dataset.label,
      },
    ],
  };
  return () => data;
};

const sparklineChartOpts = {
  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    xAxes: [
      {
        display: false,
      }],
    yAxes: [
      {
        display: false,
      }],
  },
  elements: {
    line: {
      borderWidth: 2,
    },
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 4,
      hoverBorderWidth: 3,
    },
  },
  legend: {
    display: false,
  },
};

// Main Chart


const mainChartOpts = {
  tooltips: {
    enabled: false,
    custom: CustomTooltips,
    intersect: true,
    mode: 'index',
    position: 'nearest',
    callbacks: {
      labelColor: function (tooltipItem, chart) {
        return {backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].borderColor}
      }
    }
  },
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        gridLines: {
          drawOnChartArea: false,
        },
      }],
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
          maxTicksLimit: 5,
          stepSize: Math.ceil(250 / 5),
          max: 250,
        },
      }],
  },
  elements: {
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 4,
      hoverBorderWidth: 3,
    },
  },
};

class Dashboard extends Component {
  constructor(props) {
    super(props);


    this.state = {
      dropdownOpen: false,
      radioSelected: 1,
      employeesOnlineCardData: {
        labels: times,
        datasets: [
          {
            label: '# of Employees Online',
            backgroundColor: 'rgba(255,255,255,.3)',
            borderColor: 'transparent',
            data: Array(24).fill(0),
          },
        ],
      },
      freeLaptopCardData: {
        labels: times,
        datasets: [
          {
            label: '% of Laptops Being Used',
            backgroundColor: 'rgba(255,255,255,.2)',
            borderColor: 'rgba(255,255,255,.55)',
            data: Array(24).fill(0),
          },
        ],
      },
      freeDeskMonitorsCardData: {
        labels: times,
        datasets: [
          {
            label: '% of Desk Monitors Being Used',
            backgroundColor: 'rgba(255,255,255,.2)',
            borderColor: 'rgba(255,255,255,.55)',
            data: Array(24).fill(0),
          },
        ],
      },
      freeProjectorsCardData: {
        labels: times,
        datasets: [
          {
            label: '% of Projectors Being Used',
            backgroundColor: 'rgba(255,255,255,.2)',
            borderColor: 'rgba(255,255,255,.55)',
            data: Array(24).fill(0),
          },
        ],
      },
      mainChartData : {
        labels: [],
        datasets: [
          {
            label: 'My First dataset',
            backgroundColor: hexToRgba(brandNorm, 10),
            borderColor: brandNorm,
            pointHoverBackgroundColor: '#fff',
            borderWidth: 2,
            data: [],
          },
          {
            label: 'My Second dataset',
            backgroundColor: 'transparent',
            borderColor: brandLight,
            pointHoverBackgroundColor: '#fff',
            borderWidth: 2,
            data: [],
          },
          {
            label: 'My Third dataset',
            backgroundColor: 'transparent',
            borderColor: brandDark,
            pointHoverBackgroundColor: '#fff',
            borderWidth: 2,
            data: [],
          },
        ],
      },
      date: new Date()


    };
  }

  componentDidMount() {
    axios('/api/data/list').then(dat => {
      this.processData(dat);
    })
  }

  onRadioBtnClick=(radioSelected)=> {
    this.setState({
      radioSelected: radioSelected,
      date: [this.state.date[0]]
    });
    this.dateChange(this.state.date);
  };
  dateChange = (date) => {//TODO
    let datasets = [];
    let mainChartData = {...this.state.mainChartData};
    mainChartData.labels = date.length === 1 ? times : date.map(d => {
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

    });
    if (this.state.monitorsUsedPerTeam) {


    }
    this.setState({date, mainChartData});
  };

  processData(dat) {//this method is terrible, and I know no better way of doing it, maybe I would have split it up into nicer methods if I had time.
    console.time('processData');
    //total count of all monitors
    let totalMonitors = {};
    let monitors = dat.data.monitors;
    let teams = dat.data.teams;
    //quick lookup of teams and monitors based off ids
    let teamIndex = {};
    let monitorIndex = {};
    //setup indexes
    teams.forEach(team => teamIndex[team._id] = team);
    let newMonitor = false;
    monitors.forEach(monitor => {

      monitorIndex[monitor._id] = monitor;
      newMonitor = monitor.new;//also detect new monitors

    });
    if (newMonitor) {//and send alerting message if they exist
      toast.notify("A new Monitor has been discovered, make sure to review it!");
    }

    //calculate total monitors in building+assign total monitors accessible to each team.
    for (let type in MONITOR_TYPE) {
      monitors.forEach(monitor => {
        if (monitor.type !== MONITOR_TYPE[type]) {
          return;

        }
        monitor.quota.forEach(floor => {
          if (typeof totalMonitors[MONITOR_TYPE[type]] === 'number')
            totalMonitors[MONITOR_TYPE[type]] += floor.amount;
          else totalMonitors[MONITOR_TYPE[type]] = floor.amount;
          floor.sharedWith.forEach(id => {
            let team = teamIndex[id];
            if (!team.totalMonitors)
              team.totalMonitors = {};
            if (typeof team.totalMonitors[MONITOR_TYPE[type]] === 'number')
              team.totalMonitors[MONITOR_TYPE[type]] += floor.amount;
            else team.totalMonitors[MONITOR_TYPE[type]] = floor.amount;


          });
        });
      });
    }
    let date = new Date();
    let dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    //today
    //employees online at a specific hour
    let onlineToday = Array(24).fill(0);//key: hour of day, value: array of employees online at that time.
    //monitors free at a specific hour for each type
    let monitorsUsedToday = {}, monitorsUsedPerTeam = {};
    for (let type in MONITOR_TYPE) {//populate with the current amount of monitors per type.
      monitorsUsedToday[MONITOR_TYPE[type]] = Array(date.getHours() + 1).fill(0);
    }
    teams.forEach(team => {
      monitorsUsedPerTeam[team._id] = {};
    });
    monitorsUsedPerTeam.dates = [];
    teams.forEach(team => {
      team.employees.forEach(employee => {
        employee.usageData.forEach(date => {
          date.sessions = processSessions(date);
          if (monitorsUsedPerTeam.dates.indexOf(date._id) === -1) {//add it if it isn't already there
            monitorsUsedPerTeam.dates.push(date._id);
          }

            for (let i = 0; i < 24; i++) {
              if (date._id === dateString)
                for (let session of date.sessions) {

                  if (checkTime(i, 0, session.startTime, session.endTime)) {
                    onlineToday[i]++;

                    break;

                  }
                }
              let monitorsChecked = [];//make sure we don't recount a specific type.
              for (let session of date.sessions) {
                for (let monitorSession of session.monitorsUsed) {
                  if (checkTime(i, 0, monitorSession.startTime, monitorSession.endTime) && monitorsChecked.indexOf(monitorSession.monitor.type) === -1) {
                    if (date._id === dateString)
                      monitorsUsedToday[monitorSession.monitor.type][i] += 1;
                    let monitorsUsedThisTeam = monitorsUsedPerTeam[team._id];
                    if (!monitorsUsedThisTeam[date._id]) {
                      monitorsUsedThisTeam[date._id] = Array(24).fill(0)
                    }
                    monitorsUsedThisTeam[date._id][i] += 1;
                    monitorsChecked.push(monitorSession.monitor.type);


                  }
                }
              }

            }


        })

      })
    });
    for(let team in monitorsUsedPerTeam){
      if (!monitorsUsedPerTeam.hasOwnProperty(team) || team === 'dates')
        continue;
      for(let date in monitorsUsedPerTeam[team]){
        if(!monitorsUsedPerTeam[team].hasOwnProperty(date))
          continue;
        monitorsUsedPerTeam[team][date]={byHour:monitorsUsedPerTeam[team][date],max: Math.max(...monitorsUsedPerTeam[team][date])};
      }

    }
    console.log(monitorsUsedPerTeam);
    //convert monitors used to percentages
    let monitorsUsedPercentages = JSON.parse(JSON.stringify(monitorsUsedToday));
    for (let type in monitorsUsedPercentages) {
      if (!monitorsUsedPercentages.hasOwnProperty(type))
        continue;
      for (let i = 0; i < monitorsUsedPercentages[type].length; i++) {
        monitorsUsedPercentages[type][i] = (monitorsUsedPercentages[type][i] / totalMonitors[type] * 100).toFixed(1);
      }

    }
    //set chart data
    let employeesOnlineCardData = {...this.state.employeesOnlineCardData},
      freeLaptopCardData = {...this.state.freeLaptopCardData},
      freeProjectorsCardData = {...this.state.freeProjectorsCardData},
      freeDeskMonitorsCardData = {...this.state.freeDeskMonitorsCardData},
      mainChartData = {...this.state.mainChartData};
    employeesOnlineCardData.datasets[0].data = onlineToday;
    freeLaptopCardData.datasets[0].data = monitorsUsedPercentages[MONITOR_TYPE.LAPTOP];
    freeDeskMonitorsCardData.datasets[0].data = monitorsUsedPercentages[MONITOR_TYPE.DESK];
    freeProjectorsCardData.datasets[0].data = monitorsUsedPercentages[MONITOR_TYPE.PROJECTOR];

    function processSessions(date) {
      let sessions = [];
      date.events.forEach((event, index) => {
        event.time = new Date(event.time);
        if (event.type === 'LOG_IN') {
          //find logout
          let logoutPair = null;
          let monitorsUsed = [];
          let monitor = monitorIndex[event.monitorGroup_id];
          if (monitor) {
            monitorsUsed.push({startTime: event.time, monitor});
          }
          for (let i = index + 1; i < date.events.length; i++) {
            if (i >= date.events.length)
              break;
            let other = date.events[i];
            other.time = new Date(other.time);
            if ((other.type === 'PLUG_IN' || other.type === 'LOG_OUT') && monitorsUsed.length !== 0) {//set time durations of monitor usages
              monitorsUsed[monitorsUsed.length - 1].duration = other.time - monitorsUsed[monitorsUsed.length - 1].startTime;
              monitorsUsed[monitorsUsed.length - 1].endTime = other.time;
            }
            if (other.type === 'PLUG_IN') {
              let monitor = monitorIndex[other.monitorGroup_id];
              if (monitor) {
                monitorsUsed.push({startTime: other.time, monitor});
              }
            }
            if (other.type === 'LOG_OUT') {
              logoutPair = other;
              break;
            }
          }
          if (logoutPair != null)
            sessions.push({
              startTime: event.time,
              endTime: logoutPair.time,
              duration: logoutPair.time - event.time,
              monitorsUsed
            });


        }
      });
      return sessions;
    }

    function checkTime(ch, cm, start, end) {
      let h = ch, m = cm
        , a = start.getHours(), b = start.getMinutes()
        , c = end.getHours(), d = end.getMinutes();
      if (a > c || ((a === c) && (b > d))) {
        // not a valid input
      } else {
        if (h > a && h < c) {
          return true;
        } else if (h === a && m >= b) {
          return true;
        } else return h === c && m <= d;
      }
    }

    let selectedDates = monitorsUsedPerTeam.dates.map((date, index) => {
      if (index > 10)//don't select more than 10 dates
        return undefined;
      let splitted = date.split('-');
      return new Date(parseInt(splitted[0]), parseInt(splitted[1]), parseInt(splitted[2]));
    });
    this.setState({
      data: dat.data,
      date: selectedDates,
      totalMonitors,
      monitorsUsed: monitorsUsedToday,
      monitorsUsedPerTeam,
      employeesOnlineCardData,
      freeLaptopCardData,
      freeProjectorsCardData,
      freeDeskMonitorsCardData
    });
    this.dateChange(selectedDates);


    console.log(dat.data, totalMonitors, monitorsUsedToday);
    console.timeEnd('processData');

  }


  render() {
    let hour = new Date().getHours();
    let getFree = (type) => {
      return this.state.monitorsUsed ? this.state.totalMonitors[type] - this.state.monitorsUsed[type][hour] : null;

    };
    let dateStyle={
      width: '40%'
    };
    return (
      <div className="animated fadeIn">
        <Row>

          <Col xs="12" sm="6" lg="3">
            <DashboardCard className="text-white card-1-bg" title="Free Laptops this Hour" content={getFree(MONITOR_TYPE.LAPTOP)}>
              <div className="chart-wrapper mx-3" style={{height: '70px'}}>
                <Line data={this.state.freeLaptopCardData} options={freeLaptopCardOpts} height={70}/>
              </div>

            </DashboardCard>
          </Col>

          <Col xs="12" sm="6" lg="3">
            <DashboardCard className="text-white card-2-bg" title="Free Desk Monitors this Hour"
                           content={getFree(MONITOR_TYPE.DESK)}>

              <div className="chart-wrapper mx-3" style={{height: '70px'}}>
                <Line data={this.state.freeDeskMonitorsCardData} options={freeDeskMonitorsCardOpts} height={70}/>
              </div>
            </DashboardCard>

          </Col>

          <Col xs="12" sm="6" lg="3">
            <DashboardCard className="text-white card-3-bg" title="Free Projectors this Hour"
                           content={getFree(MONITOR_TYPE.PROJECTOR)}>
              <div className="chart-wrapper" style={{height: '70px'}}>
                <Line data={this.state.freeProjectorsCardData} options={freeProjectorsCardOpts} height={70}/>
              </div>
            </DashboardCard>
          </Col>

          <Col xs="12" sm="6" lg="3">
            <DashboardCard className="text-white card-4-bg" title="Employees Currently Online"
                           request="employees/online">
              <div className="chart-wrapper mx-3" style={{height: '70px'}}>
                <Bar data={this.state.employeesOnlineCardData} options={employeesOnlineCardOpts} height={70}/>
              </div>
            </DashboardCard>
          </Col>
        </Row>
        <Row>
          <Col>
            <Card>
              <CardBody>
                <Row>
                  <Col sm="5">
                    <CardTitle className="mb-0">Total Monitor Utilization per Team</CardTitle>
                    <div className="small text-muted"></div>
                  </Col>
                  <Col sm="7" className="d-none d-sm-inline-block">
                    <Button color="primary" className="float-right"><i className="icon-cloud-download"></i></Button>
                    <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
                      <ButtonGroup className="mr-3" aria-label="First group">
                        <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(1)}
                                active={this.state.radioSelected === 1}>Day</Button>
                        <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(2)}
                                active={this.state.radioSelected === 2}>Dates</Button>
                      </ButtonGroup>

                    </ButtonToolbar>
                    <Flatpickr
                      className="form-control"
                      style={dateStyle}
                      value={this.state.date}
                      options={{
                        mode: this.state.radioSelected === 1 ? "multiple" : "range",
                        dateFormat: "Y-m-d",
                        disable: [
                          (date) => {
                            if (!this.state.monitorsUsedPerTeam)
                              return true;
                            let dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                            // return true to disable
                            return this.state.monitorsUsedPerTeam.dates.indexOf(dateString) === -1;

                          }
                        ]
                      }}
                      onChange={date => { this.dateChange(date) }} />
                  </Col>
                </Row>
                <div className="chart-wrapper" style={{height: 300 + 'px', marginTop: 40 + 'px'}}>
                  <Line data={this.state.mainChartData} options={mainChartOpts} height={300}/>
                </div>
              </CardBody>
              <CardFooter>
                <Row className="text-center">
                  <Col sm={12} md className="mb-sm-2 mb-0">
                    <div className="text-muted">Visits</div>
                    <strong>29.703 Users (40%)</strong>
                    <Progress className="progress-xs mt-2" color="success" value="40"/>
                  </Col>
                  <Col sm={12} md className="mb-sm-2 mb-0 d-md-down-none">
                    <div className="text-muted">Unique</div>
                    <strong>24.093 Users (20%)</strong>
                    <Progress className="progress-xs mt-2" color="info" value="20"/>
                  </Col>
                  <Col sm={12} md className="mb-sm-2 mb-0">
                    <div className="text-muted">Pageviews</div>
                    <strong>78.706 Views (60%)</strong>
                    <Progress className="progress-xs mt-2" color="warning" value="60"/>
                  </Col>
                  <Col sm={12} md className="mb-sm-2 mb-0">
                    <div className="text-muted">New Users</div>
                    <strong>22.123 Users (80%)</strong>
                    <Progress className="progress-xs mt-2" color="danger" value="80"/>
                  </Col>
                  <Col sm={12} md className="mb-sm-2 mb-0 d-md-down-none">
                    <div className="text-muted">Bounce Rate</div>
                    <strong>Average Rate (40.15%)</strong>
                    <Progress className="progress-xs mt-2" color="primary" value="40"/>
                  </Col>
                </Row>
              </CardFooter>
            </Card>
          </Col>
        </Row>


        <Row>
          <Col>
            <Card>
              <CardHeader>
                Traffic {' & '} Sales
              </CardHeader>
              <CardBody>
                <Row>
                  <Col xs="12" md="6" xl="6">
                    <Row>
                      <Col sm="6">
                        <div className="callout callout-info">
                          <small className="text-muted">New Clients</small>
                          <br/>
                          <strong className="h4">9,123</strong>
                          <div className="chart-wrapper">
                            <Line data={makeSparkLineData(0, brandDark)} options={sparklineChartOpts} width={100}
                                  height={30}/>
                          </div>
                        </div>
                      </Col>
                      <Col sm="6">
                        <div className="callout callout-danger">
                          <small className="text-muted">Recurring Clients</small>
                          <br/>
                          <strong className="h4">22,643</strong>
                          <div className="chart-wrapper">
                            <Line data={makeSparkLineData(1, brandNorm)} options={sparklineChartOpts} width={100}
                                  height={30}/>
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <hr className="mt-0"/>
                    <div className="progress-group mb-4">
                      <div className="progress-group-prepend">
                        <span className="progress-group-text">
                          Monday
                        </span>
                      </div>
                      <div className="progress-group-bars">
                        <Progress className="progress-xs" color="info" value="34"/>
                        <Progress className="progress-xs" color="danger" value="78"/>
                      </div>
                    </div>
                    <div className="progress-group mb-4">
                      <div className="progress-group-prepend">
                        <span className="progress-group-text">
                        Tuesday
                        </span>
                      </div>
                      <div className="progress-group-bars">
                        <Progress className="progress-xs" color="info" value="56"/>
                        <Progress className="progress-xs" color="danger" value="94"/>
                      </div>
                    </div>
                    <div className="progress-group mb-4">
                      <div className="progress-group-prepend">
                        <span className="progress-group-text">
                        Wednesday
                        </span>
                      </div>
                      <div className="progress-group-bars">
                        <Progress className="progress-xs" color="info" value="12"/>
                        <Progress className="progress-xs" color="danger" value="67"/>
                      </div>
                    </div>
                    <div className="progress-group mb-4">
                      <div className="progress-group-prepend">
                        <span className="progress-group-text">
                        Thursday
                        </span>
                      </div>
                      <div className="progress-group-bars">
                        <Progress className="progress-xs" color="info" value="43"/>
                        <Progress className="progress-xs" color="danger" value="91"/>
                      </div>
                    </div>
                    <div className="progress-group mb-4">
                      <div className="progress-group-prepend">
                        <span className="progress-group-text">
                        Friday
                        </span>
                      </div>
                      <div className="progress-group-bars">
                        <Progress className="progress-xs" color="info" value="22"/>
                        <Progress className="progress-xs" color="danger" value="73"/>
                      </div>
                    </div>
                    <div className="progress-group mb-4">
                      <div className="progress-group-prepend">
                        <span className="progress-group-text">
                        Saturday
                        </span>
                      </div>
                      <div className="progress-group-bars">
                        <Progress className="progress-xs" color="info" value="53"/>
                        <Progress className="progress-xs" color="danger" value="82"/>
                      </div>
                    </div>
                    <div className="progress-group mb-4">
                      <div className="progress-group-prepend">
                        <span className="progress-group-text">
                        Sunday
                        </span>
                      </div>
                      <div className="progress-group-bars">
                        <Progress className="progress-xs" color="info" value="9"/>
                        <Progress className="progress-xs" color="danger" value="69"/>
                      </div>
                    </div>
                    <div className="legend text-center">
                      <small>
                        <sup className="px-1"><Badge pill color="info">&nbsp;</Badge></sup>
                        New clients
                        &nbsp;
                        <sup className="px-1"><Badge pill color="danger">&nbsp;</Badge></sup>
                        Recurring clients
                      </small>
                    </div>
                  </Col>
                  <Col xs="12" md="6" xl="6">
                    <Row>
                      <Col sm="6">
                        <div className="callout callout-warning">
                          <small className="text-muted">Pageviews</small>
                          <br/>
                          <strong className="h4">78,623</strong>
                          <div className="chart-wrapper">
                            <Line data={makeSparkLineData(2, brandBland)} options={sparklineChartOpts} width={100}
                                  height={30}/>
                          </div>
                        </div>
                      </Col>
                      <Col sm="6">
                        <div className="callout callout-success">
                          <small className="text-muted">Organic</small>
                          <br/>
                          <strong className="h4">49,123</strong>
                          <div className="chart-wrapper">
                            <Line data={makeSparkLineData(3, brandLight)} options={sparklineChartOpts} width={100}
                                  height={30}/>
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <hr className="mt-0"/>
                    <ul>
                      <div className="progress-group">
                        <div className="progress-group-header">
                          <i className="icon-user progress-group-icon"></i>
                          <span className="title">Male</span>
                          <span className="ml-auto font-weight-bold">43%</span>
                        </div>
                        <div className="progress-group-bars">
                          <Progress className="progress-xs" color="warning" value="43"/>
                        </div>
                      </div>
                      <div className="progress-group mb-5">
                        <div className="progress-group-header">
                          <i className="icon-user-female progress-group-icon"></i>
                          <span className="title">Female</span>
                          <span className="ml-auto font-weight-bold">37%</span>
                        </div>
                        <div className="progress-group-bars">
                          <Progress className="progress-xs" color="warning" value="37"/>
                        </div>
                      </div>
                      <div className="progress-group">
                        <div className="progress-group-header">
                          <i className="icon-globe progress-group-icon"></i>
                          <span className="title">Organic Search</span>
                          <span className="ml-auto font-weight-bold">191,235 <span
                            className="text-muted small">(56%)</span></span>
                        </div>
                        <div className="progress-group-bars">
                          <Progress className="progress-xs" color="success" value="56"/>
                        </div>
                      </div>
                      <div className="progress-group">
                        <div className="progress-group-header">
                          <i className="icon-social-facebook progress-group-icon"></i>
                          <span className="title">Facebook</span>
                          <span className="ml-auto font-weight-bold">51,223 <span
                            className="text-muted small">(15%)</span></span>
                        </div>
                        <div className="progress-group-bars">
                          <Progress className="progress-xs" color="success" value="15"/>
                        </div>
                      </div>
                      <div className="progress-group">
                        <div className="progress-group-header">
                          <i className="icon-social-twitter progress-group-icon"></i>
                          <span className="title">Twitter</span>
                          <span className="ml-auto font-weight-bold">37,564 <span
                            className="text-muted small">(11%)</span></span>
                        </div>
                        <div className="progress-group-bars">
                          <Progress className="progress-xs" color="success" value="11"/>
                        </div>
                      </div>
                      <div className="progress-group">
                        <div className="progress-group-header">
                          <i className="icon-social-linkedin progress-group-icon"></i>
                          <span className="title">LinkedIn</span>
                          <span className="ml-auto font-weight-bold">27,319 <span
                            className="text-muted small">(8%)</span></span>
                        </div>
                        <div className="progress-group-bars">
                          <Progress className="progress-xs" color="success" value="8"/>
                        </div>
                      </div>

                    </ul>
                  </Col>
                </Row>

              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Dashboard;
