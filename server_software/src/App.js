import React, {Component} from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
// import { renderRoutes } from 'react-router-config';
import './App.scss';

import loading from './utils/LoadingAnimation';
//redux
import {Provider} from "react-redux";
import store from "./redux/store";
//auth
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/authToken";
import {logoutUser, setCurrentUser} from "./redux/actions/authActions";
import PrivateRoute from "./utils/PrivateRoute";
//the beginning of it all, assembles the program together, frontend.
// Containers
const DefaultLayout = React.lazy(() => import('./containers/DefaultLayout'));

// Pages
const Login = React.lazy(() => import('./views/Pages/Login'));
const Page404 = React.lazy(() => import('./views/Pages/Page404'));
const Page500 = React.lazy(() => import('./views/Pages/Page500'));

// Check for token to keep user logged in
if (localStorage.jwtToken) {
  // Set auth token header auth
  const token = localStorage.jwtToken;
  setAuthToken(token);
  // Decode token and get user info and exp
  const decoded = jwt_decode(token);
  // Set user and isAuthenticated
  store.dispatch(setCurrentUser(decoded));
// Check for expired token
  const currentTime = Date.now() / 1000; // to get in milliseconds
  if (decoded.exp < currentTime) {
    // Logout user
    store.dispatch(logoutUser());
    // Redirect to login
    window.location.href = "./login";
  }
}


class App extends Component {

  render() {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <React.Suspense fallback={loading()}>
            <Switch>
              <Route exact path="/login" name="Login Page" render={props => <Login {...props}/>}/>
              {/*<Route exact path="/register" name="Register Page" render={props => <Register {...props}/>} /> ignore registering for now, maybe future*/}
              <Route exact path="/404" name="Page 404" render={props => <Page404 {...props}/>}/>
              <Route exact path="/500" name="Page 500" render={props => <Page500 {...props}/>}/>
              <PrivateRoute path="/" name="Home2" component={DefaultLayout}/>
            </Switch>
          </React.Suspense>
        </BrowserRouter>
      </Provider>
    );
  }
}

export default App;
