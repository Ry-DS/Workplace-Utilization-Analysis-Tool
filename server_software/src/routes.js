import React from 'react';
//this file defines the routes. A route a subset of the domain to link to. A section of the program.
//For example, localhost/dashboard is a route to the dashboard part of the app
const Charts = React.lazy(() => import('./views/Charts'));
const Dashboard = React.lazy(() => import('./views/Dashboard'));
//CUSTOM
const Users = React.lazy(() => import('./views/Users'));
const Teams = React.lazy(() => import('./views/Teams'));
const MonitorGroups = React.lazy(() => import('./views/MonitorGroups'));
const MonitorGroup = React.lazy(() => import('./views/MonitorGroups/Monitor'));


// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/charts', name: 'Charts', component: Charts },
  {path: '/users', name: 'Users', component: Users},
  {path: '/teams', name: 'Teams', component: Teams},
  {path: '/monitor-groups', name: 'Monitor Groups', exact: true, component: MonitorGroups},//exact means allow /monitor-groups/random since we have subpages here
  {path: '/monitor-groups/:id', name: 'Monitor', exact: true, component: MonitorGroup},
];

export default routes;
