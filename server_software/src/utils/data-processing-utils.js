import {CustomTooltips} from "@coreui/coreui-plugin-chartjs-custom-tooltips";
import MONITOR_TYPE from './monitorTypes'
//to help sort out the complex code to process the data
//if this was a proper project with more time, we might do this at the backend instead to optimise experience for the user
const times = ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm',
  '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'];

function createDateString(date) {//easy method to convert a date to a readable string.
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function processSessions(date, monitorIndex) {//makes sessions out of the recorded events in a day
  //a session is defined as a login event, followed by some update events then a logout event.
  let sessions = [];
  date.events.forEach((event, index) => {//for every event in the given day
    event.time = new Date(event.time);
    if (event.type === 'LOG_IN') {//if its a login


      //find logout
      let logoutPair = null;
      let monitorsUsed = [];//storing monitors used in this session
      let monitor = monitorIndex[event.monitorGroup_id];//get monitor first used in login event
      if (monitor) {//if it exists
        monitorsUsed.push({startTime: event.time, monitor});//store it as an incomplete monitor session, we'll find the end later
      }
      for (let i = index + 1; i < date.events.length; i++) {//go through all the other events, skipping the one we just looked at. Trying to find update events and eventually a logout
        if (i >= date.events.length)//if somehow the login is all there is.
          break;
        let other = date.events[i];//the event which isn't the login event
        other.time = new Date(other.time);
        if ((other.type === 'PLUG_IN' || other.type === 'LOG_OUT') && monitorsUsed.length !== 0) {//set time durations of monitor usages
          monitorsUsed[monitorsUsed.length - 1].duration = other.time - monitorsUsed[monitorsUsed.length - 1].startTime;
          monitorsUsed[monitorsUsed.length - 1].endTime = other.time;
        }//the stuff below is still run, top one is just to make sure we complete the monitor session
        if (other.type === 'PLUG_IN') {//start a new monitor session if the event is a plugin
          let monitor = monitorIndex[other.monitorGroup_id];
          if (monitor) {
            monitorsUsed.push({startTime: other.time, monitor});
          }
        }//otherwise, get the logout pair and prepare to complete this session.
        if (other.type === 'LOG_OUT') {
          logoutPair = other;
          break;
        }
      }
      if (logoutPair != null)//found a logout event to pair up?
        sessions.push({
          startTime: event.time,
          endTime: logoutPair.time,
          duration: logoutPair.time - event.time,
          monitorsUsed
        });
      //last element, lets pretend its a completed session. Probably caused by premature shutdown.
      else if (index === date.events.length - 1) {
        let date = new Date();
        monitorsUsed.forEach(monitorSession => {//make sure all monitor sessions are valid
          if (!monitorSession.endTime) {
            monitorSession.endTime = date;
            monitorSession.duration = monitorSession.endTime - monitorSession.startTime;
          }
        });
        sessions.push({
          startTime: event.time,
          endTime: date,
          duration: date - event.time,
          monitorsUsed
        })
      }


    }
  });
  return sessions;
}
//Taken from https://stackoverflow.com/questions/9081220/how-to-check-if-current-time-falls-within-a-specific-range-on-a-week-day-using-j/32896572#32896572
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
          callback: function (value) {
            if (value % 1 === 0) {
              return value;
            }
          }
        }
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

function cleanData(dat) {
  //total count of all monitors
  let totalMonitors = {};
  let monitors = dat.data.monitors;
  let teams = dat.data.teams;
  //quick lookup of teams and monitors based off ids
  let teamIndex = {};
  let monitorIndex = {};
  //setup indexes
  teams.forEach(team => teamIndex[team._id] = team);
  monitors.forEach(monitor => {

    monitorIndex[monitor._id] = monitor;

  });

  //calculate total monitors in building+assign total monitors accessible to each team.
  MONITOR_TYPE.forEach(type => {
    monitors.forEach(monitor => {
      if (monitor.type !== type) {
        return;

      }
      monitor.quota.forEach(floor => {
        if (typeof totalMonitors[type] === 'number')//if a number is already there, add onto it
          totalMonitors[type] += floor.amount;
        else totalMonitors[type] = floor.amount;//otherwise, initialise it as a new number.
        floor.sharedWith.forEach(id => {
          let team = teamIndex[id];
          if (!team.totalMonitors)
            team.totalMonitors = {};
          if (typeof team.totalMonitors[type] === 'number')//same as above
            team.totalMonitors[type] += floor.amount;
          else team.totalMonitors[type] = floor.amount;


        });
      });
    });
  });
  teams.forEach(team => {
    team.employees.forEach(employee => {
      employee.usageData.forEach(date => {
        date.sessions = processSessions(date, monitorIndex);
      })

    })
  });
  return {teams, teamIndex, totalMonitors, monitorIndex, monitors}
}

export {createDateString, mainChartOpts, checkTime, cleanData, times};
