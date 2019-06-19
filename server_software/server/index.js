//https://www.twilio.com/blog/react-app-with-node-js-server-proxy

//this server sends data to the react application for the admin to view
const express = require('express');//express server backend
const bodyParser = require('body-parser');//for parsing requests and data given from users
const pino = require('express-pino-logger')();//better looking server logs
const EmployeeServer = require('./employee-server');

const app = express();


app.use(bodyParser.urlencoded({extended: false}));
app.use(pino);

let employeeServer = new EmployeeServer();//start employee server

app.get('/api/greeting', (req, res) => {
  const name = req.query.name || 'World';
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({greeting: `Hello ${name}!`}));
});
app.get('/api/employees/online', (req, res) => {//fetch the current amount of employees online

  res.setHeader('Content-Type', 'text/plain');
  res.send(employeeServer.connectionCount.toString());

});



app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);

