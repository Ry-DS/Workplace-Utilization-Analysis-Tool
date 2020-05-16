//Container holding various chart types to show to the user.
import React, {Component} from 'react';
import {Card} from 'reactstrap';
import BigLineChart from "../../utils/big-line-chart";
import MONITOR_TYPE from '../../utils/monitorTypes';
import './../../scss/flatpickr-bgis.scss'

import axios from "axios";
import {checkTime, cleanData, createDateString} from '../../utils/data-processing-utils'
import {getStyle, hexToRgba} from "@coreui/coreui/dist/js/coreui-utilities";
//fetch color themes from css
const brandDark = getStyle('--theme-dark');
const brandLight = getStyle('--theme-light');
const brandNorm = getStyle('--theme-norm');
const brandBland = getStyle('--theme-bland');








class Charts extends Component {
  constructor(props) {
    super(props);
    this.chartRef = React.createRef();//ref to total graph
    this.state = {}
  }

  componentDidMount() {
    axios('/api/data/list').then(dat => {//fetch data on mount
      this.processData(dat);
    })
  }

  processData(dat){
    let data = cleanData(dat);
    console.log(data);
    let monitorsUsedByType = {};//as named, for main graph
    MONITOR_TYPE.forEach(type => {//for every monitor type, make a new dataset
      monitorsUsedByType[type] = {};
    });
    monitorsUsedByType.dates = [];//store global dates to make the disabled dates for datepicker
    data.teams.forEach(team => {
      team.employees.forEach(employee => {
        employee.usageData.forEach(date => {
          if (monitorsUsedByType.dates.indexOf(date._id) === -1) {//add it if it isn't already there
            monitorsUsedByType.dates.push(date._id);
          }

          for (let i = 0; i < 24; i++) {//for every hour in the day
            let monitorsChecked = [];//make sure we don't recount a specific type.
            for (let session of date.sessions) {
              for (let monitorSession of session.monitorsUsed) {
                if (checkTime(i, 0, monitorSession.startTime, monitorSession.endTime)//see if the session is for this specific hour and hasn't been counted before.
                  && monitorsChecked.indexOf(monitorSession.monitor.type) === -1) {
                  let monitorsUsed = monitorsUsedByType[monitorSession.monitor.type];
                  if (!monitorsUsed[date._id]) {
                    monitorsUsed[date._id] = Array(24).fill(0)//make everything 0 initially.
                  }
                  monitorsUsed[date._id][i] += 1;
                  monitorsChecked.push(monitorSession.monitor.type);


                }
              }
            }

          }


        })

      })
    });

    for (let type in monitorsUsedByType) {
      if (!monitorsUsedByType.hasOwnProperty(type) || type === 'dates')
        continue;
      for (let date in monitorsUsedByType[type]) {
        if (!monitorsUsedByType[type].hasOwnProperty(date))
          continue;
        monitorsUsedByType[type][date] = {
          byHour: monitorsUsedByType[type][date],//to create by day datasets.
          max: Math.max(...monitorsUsedByType[type][date])//max value in a day, main value for a date
        };
      }

    }
    console.log(monitorsUsedByType);
    let selectedDates = monitorsUsedByType.dates.map((date, index) => {
      if (index > 5)//don't select more than 10 dates
        return undefined;
      let splitted = date.split('-');
      return new Date(parseInt(splitted[0]), parseInt(splitted[1]), parseInt(splitted[2]));
    });
    this.setState({monitorsUsedByType});
    if (this.chartRef.current) {
      this.chartRef.current.dateChange(selectedDates);//trigger update
    }


  }


  render() {
    let dateStyle = {width: '40%'};
    return (
      <div className="animated fadeIn">
        <Card>
          <BigLineChart title={"Total Monitor Usage by Type"} disableDate={(date) => {
            if (!this.state.monitorsUsedByType)
              return true;
            let dateString = createDateString(date);
            // return true to disable
            return this.state.monitorsUsedByType.dates.indexOf(dateString) === -1;

          }} dataset={(dates) => {
            let datasets = [];
            if (this.state.monitorsUsedByType) {//data exists
              for (let type in this.state.monitorsUsedByType) {//every team in dataset
                if (!this.state.monitorsUsedByType.hasOwnProperty(type) || type === 'dates')
                  continue;
                let singleDay = dates.length === 1;
                let data = Array(singleDay ? 24 : dates.length).fill(0);//data array, either 24 hours for single day or per date
                if (singleDay) {//if single day
                  let day = this.state.monitorsUsedByType[type][createDateString(dates[0])];//just get 24 hour data for that day
                  if (day) {//if it exists of course
                    data = day.byHour;
                  }
                } else//otherwise
                  for (let i = 0; i < dates.length; i++) {
                    let dayMax = this.state.monitorsUsedByType[type][createDateString(dates[i])];
                    if (dayMax) {//check every day, if it exists put it in. The max for that day
                      data[i] = dayMax.max;
                    }
                  }
                let color;
                switch (type) {
                  case MONITOR_TYPE.PROJECTOR:
                    color = brandNorm;
                    break;
                  case MONITOR_TYPE.DESK:
                    color = brandLight;
                    break;
                  case MONITOR_TYPE.LAPTOP:
                    color = brandDark;
                    break;
                }
                datasets.push({
                  label: type,
                  backgroundColor: hexToRgba(color, 10),
                  borderColor: color,
                  pointHoverBackgroundColor: '#fff',
                  borderWidth: 2,
                  data: data

                });

              }
              return datasets;

            }
          }} ref={this.chartRef}/>
        </Card>


      </div>
    );
  }
}

export default Charts;
