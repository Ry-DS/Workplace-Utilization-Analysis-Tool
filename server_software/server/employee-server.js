//this server accepts connections from the employees in order to store usage data and allow the other server to access.

const Net = require('net');
//server test
const Team = require('./models/Team');


const port = 7250;
module.exports = class EmployeeServer {
  constructor() {
    this.server = Net.createServer();
    this.connectionCount = 0;
    this.server.listen(port, () => {
      console.log("Server Listening on port: " + port);
    });
    this.server.on('connection', socket => {
      console.log('A new connection has been established.');
      socket.oldWrite=socket.write;
      socket.write=function(s){console.log(`Writing: ${s}`);this.oldWrite(s+'\r')};//make sure everything is appended with \r signifying new command

      // Now that a TCP connection has been established, the server can send data to
      // the client by writing to its socket.
      this.connectionCount++;

      // The server can also receive data from the client by reading from its socket.
      socket.on('data', function (chunk) {
        let data = chunk.toString();
        console.log(`Data received from client: ${data}`);
        let id;
        switch (data.includes(":") ? data.split(':')[0] : data) {
          case "ID":

            if(socket.employeeId){
              socket.destroy();
              console.log(`Employee ${socket.employeeId} tried registering twice`);
              return;//already logged in
            }
            id = data.split(':')[1];

            socket.employeeId = id;
            console.log(id);
            Team.findOneAndUpdate({'employees._id': id}, {$set: {'employees.$.lastLogin': Date.now()}}, {}, (err, doc) => {

              if (!doc) {
                Team.find({},{name: 1,_id: 0},(err,teams)=>{
                  if(teams&&teams.length!==0){
                    teams=teams.map(team=>team.name);
                    socket.write('INIT:'+teams.join(':'))
                  }

                });
              }else socket.write('SUCCESS');


            });
            break;

          case "REGISTER":
            let teamName = data.split(':')[1];
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
              }
              else socket.write('SUCCESS');
            });
            break;
          case 'UPDATE':
            id=socket.employeeId;
            if(!id){
              socket.destroy();
              console.log("Invalid update occurred: No attached MAC ID");
              return;
            }
            Team.findOneAndUpdate({'employees._id': id}, {/*$set: {'employees.$.lastLogin': Date.now()}*/}, {}, (err, doc) => {

            /*  if (!doc) {
                Team.find({},{name: 1,_id: 0},(err,teams)=>{
                  if(teams&&teams.length!==0){
                    teams=teams.map(team=>team.name);
                    socket.write('INIT:'+teams.join(':'))
                  }

                });
              }else socket.write('SUCCESS');
*/

            });




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


