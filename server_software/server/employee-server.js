//this server accepts connections from the employees in order to store usage data in mongodb

const Net = require('net');
//mongodb data models
const Team = require('./models/Team');
const MonitorGroup = require('./models/MonitorGroup');


const port = 7250;//port to listen to
module.exports = class EmployeeServer {
  constructor() {
    //server creation
    this.server = Net.createServer();
    this.connectionCount = 0;
    this.server.listen(port, () => {
      console.log("Server Listening on port: " + port);
    });
    this.server.on('connection', socket => {//connection listener
      console.log('A new connection has been established.');
      socket.oldWrite = socket.write;//we are going to rewrite the write method in the api next line, so store the old one.
      socket.write=function(s){console.log(`Writing: ${s}`);this.oldWrite(s+'\r')};//make sure everything is appended with \r signifying new command

      // Now that a TCP connection has been established, the server can send data to
      // the client by writing to its socket.
      //count the connection, provides live count of active connections
      this.connectionCount++;
      socket.firstUpdate=true;//detect first update

      // The server can also receive data from the client by reading from its socket.
      socket.on('data', function (chunk) {
        let data = chunk.toString();
        let params = data.split(':');
        console.log(`Data received from client: ${data}`);
        let id;
        switch (data.includes(":") ? params[0] : data) {//parse the request the employee sent
          case "ID":

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


              } else socket.destroy();//end connection, let them try again later


            });
            break;

          case "REGISTER":
            let teamName = params[1];
            id=socket.employeeId;

            if(!id){
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
            }, {/*upsert: true/*Testing only*/}, (err, doc) => {
              if (!doc) {
                Team.find({},{name: 1,_id: 0},(err,teams)=>{
                  if(teams&&teams.length!==0){
                    teams=teams.map(team=>team.name);
                    socket.write('INIT:'+teams.join(':'))
                  }

                });
              } else {
                socket.write('SUCCESS');
                socket.active = true
              }
            });
            break;
          case 'UPDATE':
            id=socket.employeeId;

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
            let monitorId = pair(monitorType.machineId, monitorType.productId);
            MonitorGroup.findOne({_id: monitorId}).then(monitor => {//create new monitor if it doesn't exist
              if (!monitor) {
                let monitor = new MonitorGroup({
                  name: monitorType.friendlyName ? monitorType.friendlyName : monitorType.machineCode,
                  friendlyName: this.name,
                  _id: monitorId//type set by default to be set later
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

              d.events.push({monitorGroup_id: monitorId, wasCheckin: firstUpdate});//time should be added automatically
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

      // When the client requests to end the TCP connection with the server, the server
      // ends the connection.

      socket.on('end', () => {
        console.log('Closing connection with the client');
        this.connectionCount--;
      });

      // Don't forget to catch error, for your own sake.

      socket.on('error', err => {
        console.log(`Error: ${err}`);
        this.connectionCount--;
      });
    });
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
    ,a=start[0],b=start[1]
    ,c=end[0],d=end[1];
  if (a > c || ((a == c) && (b > d))) {
    // not a valid input
  } else {
    if (h > a && h < c) {
      return true;
    } else if (h == a && m >= b) {
      return true;
    } else if (h == c && m <= d) {
      return true;
    } else {
      return false;
    }
  }
}

