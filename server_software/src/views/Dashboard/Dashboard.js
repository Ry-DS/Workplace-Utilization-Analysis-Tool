import React, {Component} from 'react';
import {Bar, Line} from 'react-chartjs-2';
import {Card, Col, Row,} from 'reactstrap';
import {CustomTooltips} from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import {hexToRgba} from '@coreui/coreui/dist/js/coreui-utilities'
import DashboardCard from "./DashboardCard";
import {checkTime, cleanData, createDateString, times} from '../../utils/data-processing-utils'
import BigLineChart from '../../utils/big-line-chart';
//data stuff
import axios from 'axios';
import MONITOR_TYPE from '../../utils/monitorTypes';
import toast from 'toasted-notes'
import 'toasted-notes/src/styles.css';

//main dashboard cards
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





class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.chartRef = React.createRef();//ref to update chart on data fetch
    this.state = {//default state, outlines chart designs.
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
        datasets: [],
      }

    };
  }

  componentDidMount() {
    axios('/api/data/list').then(dat => {//once component is loaded, start checking DB for data
      this.processData(dat);
    })
  }


  processData(raw) {//this method is terrible, and I know no better way of doing it, maybe I would have split it up into nicer methods if I had time.
    console.time('processData');
    let data = cleanData(raw);

    let newMonitor = false;
    data.monitors.forEach(monitor => {

      newMonitor = monitor.new;//also detect new monitors

    });
    if (newMonitor) {//and send alerting message if they exist
      toast.notify("A new Monitor has been discovered, make sure to review it!");
    }
    let date = new Date();
    let dateString = createDateString(date);

    //today
    //employees online at a specific hour
    let onlineToday = Array(24).fill(0);//key: hour of day, value: array of employees online at that time.
    //monitors free at a specific hour for each type
    let monitorsUsedToday = {}, monitorsUsedPerTeam = {};
    MONITOR_TYPE.forEach((type) => {//populate with the current amount of monitors per type.
      monitorsUsedToday[type] = Array(date.getHours() + 1).fill(0);
    });
    data.teams.forEach(team => {
      monitorsUsedPerTeam[team._id] = {};
    });
    monitorsUsedPerTeam.dates = [];
    data.teams.forEach(team => {
      team.employees.forEach(employee => {
        employee.usageData.forEach(date => {
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
    //convert monitors used to percentages
    let monitorsUsedPercentages = JSON.parse(JSON.stringify(monitorsUsedToday));
    for (let type in monitorsUsedPercentages) {
      if (!monitorsUsedPercentages.hasOwnProperty(type))
        continue;
      for (let i = 0; i < monitorsUsedPercentages[type].length; i++) {
        monitorsUsedPercentages[type][i] = (monitorsUsedPercentages[type][i] / data.totalMonitors[type] * 100).toFixed(1);
      }

    }
    //set chart data
    let employeesOnlineCardData = {...this.state.employeesOnlineCardData},
      freeLaptopCardData = {...this.state.freeLaptopCardData},
      freeProjectorsCardData = {...this.state.freeProjectorsCardData},
      freeDeskMonitorsCardData = {...this.state.freeDeskMonitorsCardData};
    employeesOnlineCardData.datasets[0].data = onlineToday;
    freeLaptopCardData.datasets[0].data = monitorsUsedPercentages[MONITOR_TYPE.LAPTOP];
    freeDeskMonitorsCardData.datasets[0].data = monitorsUsedPercentages[MONITOR_TYPE.DESK];
    freeProjectorsCardData.datasets[0].data = monitorsUsedPercentages[MONITOR_TYPE.PROJECTOR];



    let selectedDates = monitorsUsedPerTeam.dates.map((date, index) => {
      if (index > 10)//don't select more than 10 dates
        return undefined;
      let splitted = date.split('-');
      return new Date(parseInt(splitted[0]), parseInt(splitted[1]), parseInt(splitted[2]));
    });
    this.setState({
      monitorIndex: data.monitorIndex,
      teamIndex: data.teamIndex,
      date: selectedDates,
      totalMonitors: data.totalMonitors,
      monitorsUsed: monitorsUsedToday,
      monitorsUsedPerTeam,
      employeesOnlineCardData,
      freeLaptopCardData,
      freeProjectorsCardData,
      freeDeskMonitorsCardData
    });
    if (this.chartRef.current)
      this.chartRef.current.dateChange(selectedDates);


    console.timeEnd('processData');

  }


  render() {
    let hour = new Date().getHours();
    let getFree = (type) => {
      return this.state.monitorsUsed && this.state.monitorsUsed[type] ? this.state.totalMonitors[type] - this.state.monitorsUsed[type][hour] : null;

    };

    return (
      <div className="animated fadeIn">
        {/*Cards at top*/}
        <Row>

          <Col xs="12" sm="6" lg="3">
            <DashboardCard className="text-white card-1-bg" title="Laptops not in use this Hour"
                           content={getFree(MONITOR_TYPE.LAPTOP)}>
              <div className="chart-wrapper mx-3" style={{height: '70px'}}>
                <Line data={this.state.freeLaptopCardData} options={freeLaptopCardOpts} height={70}/>
              </div>

            </DashboardCard>
          </Col>

          <Col xs="12" sm="6" lg="3">
            <DashboardCard className="text-white card-2-bg" title="Desk Monitors not in use this Hour"
                           content={getFree(MONITOR_TYPE.DESK)}>

              <div className="chart-wrapper mx-3" style={{height: '70px'}}>
                <Line data={this.state.freeDeskMonitorsCardData} options={freeDeskMonitorsCardOpts} height={70}/>
              </div>
            </DashboardCard>

          </Col>

          <Col xs="12" sm="6" lg="3">
            <DashboardCard className="text-white card-3-bg" title="Display Screens not in use this Hour"
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
        {/*Big Chart*/}
        <Row>
          <Col>
            <Card>
              <BigLineChart ref={this.chartRef} title="Total Monitor Utilization per Team" disableDate={(date) => {
                if (!this.state.monitorsUsedPerTeam)
                  return true;
                let dateString = createDateString(date);
                // return true to disable
                return this.state.monitorsUsedPerTeam.dates.indexOf(dateString) === -1;

              }} dataset={(dates) => {
                let datasets = [];
                if (this.state.monitorsUsedPerTeam) {//data exists
                  for (let teamId in this.state.monitorsUsedPerTeam) {//every team in dataset
                    if (!this.state.monitorsUsedPerTeam.hasOwnProperty(teamId) || teamId === 'dates')
                      continue;
                    let team = this.state.teamIndex[teamId];
                    let singleDay = dates.length === 1;
                    let data = Array(singleDay ? 24 : dates.length).fill(0);//data array, either 24 hours for single day or per date
                    if (singleDay) {//if single day
                      let day = this.state.monitorsUsedPerTeam[teamId][createDateString(dates[0])];//just get 24 hour data for that day
                      if (day) {//if it exists of course
                        data = day.byHour;
                      }
                    } else//otherwise
                      for (let i = 0; i < dates.length; i++) {
                        let dayMax = this.state.monitorsUsedPerTeam[teamId][createDateString(dates[i])];
                        if (dayMax) {//check every day, if it exists put it in. The max for that day
                          data[i] = dayMax.max;
                        }
                      }
                    datasets.push({
                      label: team.name,
                      backgroundColor: hexToRgba(team.color, 10),
                      borderColor: team.color,
                      pointHoverBackgroundColor: '#fff',
                      borderWidth: 2,
                      data: data

                    });

                  }
                  return datasets;

                }
              }}/>


            </Card>
          </Col>
        </Row>



      </div>
    );
  }

}


export default Dashboard;
