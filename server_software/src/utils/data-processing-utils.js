import {CustomTooltips} from "@coreui/coreui-plugin-chartjs-custom-tooltips";
import MONITOR_TYPE from './monitorTypes'

function createDateString(date) {//easy method to convert a date to a readable string.
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function processSessions(date, monitorIndex) {
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
      //last element, lets pretend its a completed session
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
  for (let type in MONITOR_TYPE) {
    monitors.forEach(monitor => {
      if (monitor.type !== MONITOR_TYPE[type]) {
        return;

      }
      monitor.quota.forEach(floor => {
        if (typeof totalMonitors[MONITOR_TYPE[type]] === 'number')//if a number is already there, add onto it
          totalMonitors[MONITOR_TYPE[type]] += floor.amount;
        else totalMonitors[MONITOR_TYPE[type]] = floor.amount;//otherwise, initialise it as a new number.
        floor.sharedWith.forEach(id => {
          let team = teamIndex[id];
          if (!team.totalMonitors)
            team.totalMonitors = {};
          if (typeof team.totalMonitors[MONITOR_TYPE[type]] === 'number')//same as above
            team.totalMonitors[MONITOR_TYPE[type]] += floor.amount;
          else team.totalMonitors[MONITOR_TYPE[type]] = floor.amount;


        });
      });
    });
  }
  teams.forEach(team => {
    team.employees.forEach(employee => {
      employee.usageData.forEach(date => {
        date.sessions = processSessions(date, monitorIndex);
      })

    })
  });
  return {teams, teamIndex, totalMonitors, monitorIndex, monitors}
}

export {createDateString, mainChartOpts, checkTime, cleanData};
