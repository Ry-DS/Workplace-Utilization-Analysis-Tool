//https://www.twilio.com/blog/react-app-with-node-js-server-proxy
//backend built with the assistance of the above resource.
//the main class for the backend.
const bootWithFrontend = false;//for testing, normally true. True means the frontend is running in the same instance as the backend.
//we normally split them for easier debugging.

//this server sends data to the react application for the admin to view
const express = require('express');//express server backend
const bodyParser = require('body-parser');//for parsing requests and data given from users
const pino = require('express-pino-logger')();//better looking server logs

//database and auth stuff
const passport=require('passport');
const users=require('./routes/users');
const teams = require('./routes/teams');
const monitors = require('./routes/monitors');
const data = require('./routes/data');
const {onShutdown} = require('node-graceful-shutdown');


const EmployeeServer = require('./employee-server');//employee server for employees to connect and give data

const mongoose = require('mongoose');
const mongoURI = require('./keys').mongoURI;//mongo auth key


startupMongoConnection();//stored in mongoose dependency
const expressServer = startupExpressServer();
const employeeServer = startupEmployeeServer();
setupQuitHandler();


function startupEmployeeServer() {
  return new EmployeeServer();//start employee server
}

function startupExpressServer() {
  const app=express();

  if(bootWithFrontend)
  app.use('/',express.static('build'));
  //setup express addins
  //this one allows us to parse/send uris
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(pino);//this one gives better looking logs to console
  app.use(bodyParser.json());//this one allows us to parse json instantly in the response

  //setup login stuff
  // Passport middleware
  app.use(passport.initialize());

  // Passport config
  require("./passport-config").passportConfig(passport);
  // Routes
  app.use("/api/users", users);
  app.use('/api/teams', teams);
  app.use('/api/monitors', monitors);
  app.use('/api/data', data);
//setup default request stuff
  app.get('/api/greeting', (req, res) => {
    const name = req.query.name || 'World';
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({greeting: `Hello ${name}!`}));
  });

  app.get('/api/employees/online', passport.authenticate('jwt', {session: false}), (req, res) => {//fetch the current amount of employees online
    res.setHeader('Content-Type', 'text/plain');
    res.send(employeeServer.connectionAmount().toString());

  });
  if(bootWithFrontend)
  app.get('*', function(req, res){
    res.redirect('/#/dashboard');
  });

  app.listen(3001, () =>
    console.log('Express server is running on localhost:3001')
  );
  return app;
}

function startupMongoConnection() {
  mongoose.connect(
    mongoURI,
    {useNewUrlParser: true}
  )
    .then(() => console.log("MongoDB successfully connected"))
    .catch(err => {
      console.log(err);
      console.log("Failed to connect to MongoDB");
      setTimeout(()=>{console.log('Retrying...');startupMongoConnection();}, 1000)
    });
}

function setupQuitHandler() {//make sure to shutdown gracefully.
  onShutdown('http-server', async () => {
    console.log("Closing employee server...");
    for (let conn of employeeServer.connections) {
      await employeeServer.closeEvent(conn);
      console.log('Closed Socket: ' + conn.employeeId);
    }
    employeeServer.server.close();

  });

}









