//this server accepts connections from the employees in order to store usage data in mongodb

const Net = require('net');
//mongodb data models
const Team = require('./models/Team');
const MonitorGroup = require('./models/MonitorGroup');
const EVENT_TYPE = require('./eventType');


const port = 7250;//port to listen to
module.exports = class EmployeeServer {
  constructor() {
    //server creation
    this.server = Net.createServer();
    this.connections = [];
    this.server.listen(port, () => {
      console.log("Server Listening on port: " + port);
    });


    this.server.on('connection', socket => {//connection listener
      console.log('A new connection has been established.');

      socket.oldWrite = socket.write;//we are going to rewrite the write method in the api next line, so store the old one.
      socket.write=function(s){console.log(`Writing: ${s}`);this.oldWrite(s+'\r')};//make sure everything is appended with \r signifying new command
      socket.oldDestroy = socket.destroy;
      socket.destroy = function (e) {//same for destroy, I wanna know when a connection is destroyed
        console.log("Destroying connection...");
        this.oldDestroy(e);
      };
      // Now that a TCP connection has been established, the server can send data to
      // the client by writing to its socket.
      //count the connection, provides live count of active connections
      this.connections.push(socket);
      socket.firstUpdate=true;//detect first update

      // The server can also receive data from the client by reading from its socket.
      socket.on('data', (chunk) => {
        let data = chunk.toString();
        let params = data.split(':');
        if (data === 'PING')//stupid thing we need to do cause c# needs a ping message to verify connection health
        {
          if (socket.active && socket.startTime && socket.endTime && !checkTime(socket.startTime, socket.endTime)) {//we can disconnect them once the time passes
            socket.destroy();
            console.log('Socket disconnected from ping: out of time range');
            if (socket.employeeId)
              this.closeEvent(socket);
          }
          return;
        }
        console.log(`Data received from client: ${data}`);
        let id;
        switch (data.includes(":") ? params[0] : data) {//parse the request the employee sent
          case "ID"://sent first by employee

            if (socket.employeeId) {//see if they already sent an ID command
              socket.destroy();

              console.log(`Employee ${socket.employeeId} tried registering twice`);
              return;//already logged in
            }
            id = params[1];//read parameters

            socket.employeeId = id;
            //try find the employee in mongodb, if found, update last login time and perform function
            Team.findOneAndUpdate({'employees._id': id}, {$set: {'employees.$.lastLogin': Date.now()}}, {}, (err, doc) => {

              if (!doc) {//doesn't exist? Send team list to the employee to register as a new client
                Team.find({},{name: 1,_id: 0},(err,teams)=>{
                  if(teams&&teams.length!==0){
                    teams=teams.map(team=>team.name);
                    socket.write('INIT:'+teams.join(':'))
                  }

                });
              } else if(checkTime(doc.startTime,doc.endTime)) {//check tracking time is imminent
                  socket.write('SUCCESS');//let employee know they are a go and accept update messages

                  socket.active = true;
                socket.endTime = doc.endTime;//say when the socket should disconnects
                socket.startTime = doc.startTime;

              } else{ socket.destroy();
                console.log('Socket disconnected from login: out of time range');
              }//end connection, let them try again later


            });
            break;

          case "REGISTER"://sent if employee needs to set their team after being given a list by INIT command
            let teamName = params[1];
            id = socket.employeeId;//we assume from now on they already sent an ID command

            if (!id) {//no id?
              socket.destroy();
              console.log("Invalid register occurred: No attached MAC ID");
              return;
            }
            Team.findOneAndUpdate({'employees._id':id},{$pull:{employees:{_id: id}}});//remove the old employee
            Team.findOneAndUpdate({name: teamName}, {
              $push: {
                employees: {
                  _id: id,
                  lastLogin: Date.now()
                }
              }
            }, {/*upsert: true/*Testing only, true means employees can create teams which is obviously bad*/}, (err, doc) => {
              if (!doc) {
                Team.find({}, {name: 1, _id: 0}, (err, teams) => {//means we only want the names of the teams.
                  if(teams&&teams.length!==0){
                    teams=teams.map(team=>team.name);
                    socket.write('INIT:'+teams.join(':'))
                  }

                });
              } else {
                socket.write('SUCCESS');
                socket.active = true//means the connection is active and ready to track
              }
            });
            break;
          case 'UPDATE'://on monitor update event (new monitor plugged in)
            id=socket.employeeId;
            //validity checks
            if(!id){
              socket.destroy();
              console.log("Invalid update occurred: No attached MAC ID");
              return;
            }
            if(!socket.active){
              socket.destroy();
              console.log("Invalid update occurred: Client wasn't registered");
              return;
            }
            //monitor identifying...
            let monitorType = {
              friendlyName: params[1],
              machineCode: params[2],
              machineId: parseInt(params[3]),
              productId: parseInt(params[4])
            };
            let monitorId = pair(monitorType.machineId, monitorType.productId);//generates a unique code to identify this monitor
            MonitorGroup.findOne({_id: monitorId}).then(monitor => {//create new monitor if it doesn't exist
              if (!monitor) {//TODO limit on if employees can add new monitors. Possible with more time
                let monitor = new MonitorGroup({
                  name: monitorType.friendlyName ? monitorType.friendlyName : monitorType.machineCode,
                  friendlyName: monitorType.friendlyName ? monitorType.friendlyName : monitorType.machineCode,
                  _id: monitorId,//type set by default to be set later
                  createdBy: id
                });
                monitor.save();

              }
            });
            //date identifying...
            let date=new Date();
            let dateString=`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            //identify whether it was the first update after a checkin
            let firstUpdate=socket.firstUpdate;
            socket.firstUpdate=false;
            let addEvent = (d) => {//helper function to add event to a usage date.
              if (!d.events)
                d.events = [];

              d.events.push({monitorGroup_id: monitorId, type: firstUpdate ? EVENT_TYPE.LOG_IN : EVENT_TYPE.PLUG_IN});//time should be added automatically
            };
            Team.findOne({'employees._id': id})//find employee in teams db
              .then(team=>{//this promise is overly complex, even I find it hard to comprehend/write. Maybe there's a better way
                if(!team){//if team doesn't exist
                  socket.destroy();
                  console.log("Invalid connection on client during update. ID: "+socket.employeeId);
                  return;//destroy connection, it didn't register properly or team deleted, they should reconnect
                }
                if(!checkTime(team.startTime,team.endTime)){//update wasn't within tracking time
                  //end their connection
                  socket.destroy();
                  console.log('Socket disconnected from updating: out of time range');
                  this.closeEvent(socket);

                  return;
                }

                for (let employee of team.employees){//find the employee in the team
                  if(employee._id===id){
                    let recordDate;//find the date to add the event
                    for(let d of employee.usageData){

                      if(d._id===dateString){
                          recordDate=d;
                          break;//found it, exit this 'for' loop
                      }
                    }
                    if(!recordDate){//doesn't exist? create a new one
                      recordDate={_id: dateString};
                      addEvent(recordDate);
                      employee.usageData.push(recordDate);//it didn't exist before so we need to push it.
                    }else addEvent(recordDate);//otherwise, we can just add it and object reference should update
                    team.save().catch(err=>{//finally, save
                      console.log(err);
                      console.log(`Failed to save event. ID: ${id}`)
                    });




                    return;
                  }
                }

              })
              .catch(err=>{console.log(err);});
        }
      });

      socket.on('end', () => {
        console.log('Closing connection with the client');
        this.connections.splice(this.connections.indexOf(socket), 1);
        this.closeEvent(socket);
      });

      // Don't forget to catch error

      socket.on('error', err => {
        console.log(`Error: ${err}`);
        this.connections.splice(this.connections.indexOf(socket), 1);
        this.closeEvent(socket);
      });
      socket.on('close', () => {
        console.log('Closing socket...');
        this.connections.splice(this.connections.indexOf(socket), 1);

      })

    });
  }

  // When the client requests to end the TCP connection with the server, the server
  // ends the connection.
//there are several ways the connection can end, so we have a single event for them all.
  closeEvent(socket) {//purpose is to gracefully put a logout event after closing
    if (!socket.active || !socket.employeeId)//they never were sending updates in the first place, don't bother
      return;
    //date identifying...
    let date = new Date();
    let dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    let addEvent = (d) => {//helper function to add event to a usage date.
      if (!d.events)
        d.events = [];

      d.events.push({type: EVENT_TYPE.LOG_OUT});//time should be added automatically
    };
    return Team.findOne({'employees._id': socket.employeeId})//find employee in teams db
      .then(team => {//this promise is overly complex, even I find it hard to comprehend/write. Maybe there's a better way
        if (!team) {//if team doesn't exist
          return;
        }


        for (let employee of team.employees) {//find the employee in the team
          if (employee._id === socket.employeeId) {
            let recordDate;//find the date to add the event
            for (let d of employee.usageData) {

              if (d._id === dateString) {
                recordDate = d;
                break;//found it, exit this 'for' loop
              }
            }
            if (!recordDate) {//doesn't exist? create a new one
              recordDate = {_id: dateString};
              addEvent(recordDate);
              employee.usageData.push(recordDate);//it didn't exist before so we need to push it.
            } else addEvent(recordDate);//otherwise, we can just add it and object reference should update
            team.save().catch(err => {//finally, save
              console.log(err);
              console.log(`Failed to save event. ID: ${socket.employeeId}`)
            });


            return;
          }
        }

      })
      .catch(err => {
        console.log(err);
      });

  }

  connectionAmount() {
    return this.connections.length;
  }


};

//https://en.wikipedia.org/wiki/Pairing_function
function pair(mId, pId) {//pairs two numbers in a unique fashion
  return ((mId + pId) * (mId + pId + 1)) / 2 + pId;


}
//https://stackoverflow.com/questions/9081220/how-to-check-if-current-time-falls-within-a-specific-range-on-a-week-day-using-j/32896572#32896572
function checkTime (start,end){
  let time=new Date();
  start=start.split(':');
  end=end.split(':');
  let h=time.getHours(),m=time.getMinutes()
    ,a=parseInt(start[0]),b=parseInt(start[1])
    ,c=parseInt(end[0]),d=parseInt(end[1]);
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

